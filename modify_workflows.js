const fs = require('fs');

// Helpers for n8n format
function genId() {
  return require('crypto').randomUUID();
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function run() {
  // 1. Load Workflow 2 (Gmail Poller)
  const wf2 = JSON.parse(fs.readFileSync('./2-Gmail Poller.json', 'utf8'));
  
  // Update node: "Check If Already Processed"
  // Currently searches by gmail_message_id. We also want to know if the THREAD exists.
  // We'll leave the existing nodes but update the Save nodes.
  const saveCustomerNode = wf2.nodes.find(n => n.name === 'Save Email Thread — Customer (with Draft)');
  if (saveCustomerNode) {
    saveCustomerNode.name = 'Save Email Thread — Customer (Start Bot)';
    saveCustomerNode.parameters.jsonBody = `={{ JSON.stringify({ 
  gmail_thread_id: $node['Parse Classification'].json.threadId, 
  gmail_message_id: $node['Parse Classification'].json.messageId, 
  classification: 'CUSTOMER', 
  subject: $node['Prepare Draft Data'].json.subject, 
  sender_email: $node['Prepare Draft Data'].json.senderEmail, 
  sender_name: $node['Prepare Draft Data'].json.senderName, 
  draft_created: false, 
  status: 'active',
  bot_enabled: true,
  qualification_step: 1,
  processed_at: new Date().toISOString() 
}) }}`;
  }

  // Update Claude system prompt for the first reply (was "Generate Draft")
  const draftNode = wf2.nodes.find(n => n.name === 'Claude — Generate Draft');
  if (draftNode) {
    draftNode.name = 'Claude — Generate First Reply';
    draftNode.parameters.options.system = "=You write email responses for a landscaping company.\\n\\n{{ $json.knowledgeBlock }}\\n\\n## YOUR TASK\\nWrite a warm, professional reply directly to the customer that:\\n1. Opens by thanking them by name\\n2. Answers their specific question using company knowledge\\n3. Asks for their phone number to discuss the project (crucial!)\\n\\nOutput ONLY the email body text. Keep it under 150 words.";
  }

  // Send the email directly instead of a draft
  const createDraftNode = wf2.nodes.find(n => n.name === 'Gmail — Create Draft Reply');
  if (createDraftNode) {
    createDraftNode.name = 'Gmail — Send First Reply';
    createDraftNode.parameters.resource = 'message';
    createDraftNode.parameters.operation = 'send';
  }

  // Add a node to save the outbound message to email_messages
  const saveOutboundMsgNode = {
    "parameters": {
      "method": "POST",
      "url": "=https://rifktjxmadzfrdclxpfz.supabase.co/rest/v1/email_messages",
      "authentication": "predefinedCredentialType",
      "nodeCredentialType": "supabaseApi",
      "sendHeaders": true,
      "headerParameters": { "parameters": [{ "name": "Prefer", "value": "return=representation" }] },
      "sendBody": true,
      "specifyBody": "json",
      "jsonBody": "={{ JSON.stringify({ thread_id: $node['Save Email Thread — Customer (Start Bot)'].json[0].id, gmail_message_id: $node['Gmail — Send First Reply'].json.id, direction: 'outbound', content: $node['Prepare Draft Data'].json.draftBody, sent_by_bot: true, sent_at: new Date().toISOString() }) }}",
      "options": {}
    },
    "id": genId(),
    "name": "Save Outbound Email Message",
    "type": "n8n-nodes-base.httpRequest",
    "typeVersion": 4.2,
    "position": [ 3300, 144 ],
    "credentials": { "supabaseApi": { "id": "I1AKQYGeNizcWsiI", "name": "Supabase account" } }
  };
  wf2.nodes.push(saveOutboundMsgNode);

  // Connection logic for the new node:
  wf2.connections['Save Email Thread — Customer (Start Bot)'] = {
    "main": [ [ { "node": "Save Outbound Email Message", "type": "main", "index": 0 } ] ]
  };

  fs.writeFileSync('./2-Gmail Poller.json', JSON.stringify(wf2, null, 2));
  console.log("Updated 2-Gmail Poller.json");

  // ---------------------------------------------------------
  // 2. Modify Workflow 1B (Ask for Email)
  // ---------------------------------------------------------
  const wf1b = JSON.parse(fs.readFileSync('./Workflow 1B — Debounce Processor.json', 'utf8'));
  
  const buildPromptNode = wf1b.nodes.find(n => n.name === 'Message a model1');
  if (buildPromptNode) {
    let systemPrompt = buildPromptNode.parameters.options.system.toString();
    // Verify it doesn't already have step 6 (or whatever number Email is)
    if (!systemPrompt.includes('Step 5: EMAIL')) {
      // It's mostly just text replacement
      // Ensure the prompt mentions email
      // Not strictly necessary if it's already updated, but let's be safe.
    }
  }

  // ---------------------------------------------------------
  // 3. Create Workflow 7 (Email Debounce Processor)
  // ---------------------------------------------------------
  // Let's copy wf1b's structure since it's basically the same but for emails, 
  // but it's simpler to just make a clean one or a stripped down clone.
  const wf7 = clone(wf1b);
  
  // Wipe connections we'll rebuild
  wf7.connections = {};

  // Clean out non-essential nodes
  wf7.nodes = wf7.nodes.filter(n => !['Delete Messages', 'Delete Conversation', 'Delete Contact', 'Send Reset Confirmation', 'IF — Reset Requested'].includes(n.name));

  // Modify Trigger
  const triggerNode = wf7.nodes.find(n => n.name === 'Schedule Trigger — Every 15s1');
  triggerNode.name = 'Schedule Trigger — Every 60s';
  triggerNode.parameters.rule.interval = [{ field: 'seconds', secondsInterval: 60 }];

  // Find pending email threads instead of WA conversations
  const findPendingNode = wf7.nodes.find(n => n.name === 'Find Pending Conversations1');
  findPendingNode.name = 'Find Pending Email Threads';
  findPendingNode.parameters.url = '=https://rifktjxmadzfrdclxpfz.supabase.co/rest/v1/email_threads';
  findPendingNode.parameters.queryParameters.parameters = [
    { name: 'pending_reply', value: 'eq.true' },
    { name: 'bot_enabled', value: 'eq.true' },
    { name: 'select', value: '*' }
  ];

  // Modify Filter Node
  const filterNode = wf7.nodes.find(n => n.name === 'Filter — Ready to Process1');
  filterNode.name = 'Filter — Ready Email Threads';
  filterNode.parameters.jsCode = `const items = $input.all();
const results = [];
const now = new Date();
const DEBOUNCE_SECONDS = 300; // 5 mins for email

for (const item of items) {
  const data = item.json;
  if (!data.pending_reply) continue;
  
  const pendingSince = new Date(data.last_reply_at || Date.now());
  const ageSeconds = (now.getTime() - pendingSince.getTime()) / 1000;
  
  if (ageSeconds >= DEBOUNCE_SECONDS) {
    results.push({ json: data });
  }
}
return results;`;

  // Get Email Messages
  const getMsgsNode = wf7.nodes.find(n => n.name === 'Get Message History1');
  getMsgsNode.name = 'Get Email Message History';
  getMsgsNode.parameters.url = '=https://rifktjxmadzfrdclxpfz.supabase.co/rest/v1/email_messages';
  getMsgsNode.parameters.queryParameters.parameters.find(p => p.name === 'conversation_id').name = 'thread_id';
  getMsgsNode.parameters.queryParameters.parameters.find(p => p.name === 'thread_id').value = '=eq.{{ $json.id }}';

  // Build OpenAI message for Email
  const buildMsgNode = wf7.nodes.find(n => n.name === 'Build OpenAI Message1');
  buildMsgNode.name = 'Build AI Prompt (Email)';
  buildMsgNode.parameters.jsCode = `const thread = $('Filter — Ready Email Threads').first().json;
const history = $('Get Email Message History').all().map(i => i.json).reverse();

const historyStr = history.map((m, i) => \`[\${i + 1}] Direction: \${m.direction} | Content: \${m.content}\`).join('\\n\\n---');

const userMessage = \`COLLECTED DATA:
Address: \${thread.collected_address ?? 'NOT YET COLLECTED'}
Wishes: \${thread.collected_wishes ?? 'NOT YET COLLECTED'}
Dimensions: \${thread.collected_dimensions ?? 'NOT YET COLLECTED'}
Phone: \${thread.collected_phone ?? 'NOT YET COLLECTED'}
Current step: \${thread.qualification_step ?? 1}
Qualification complete: \${thread.qualification_complete ? 'YES' : 'NO'}

EMAIL MESSAGE HISTORY:
\${historyStr || '(No prior messages)'}\`;

return [{ json: { userMessage, thread_id: thread.id, gmail_thread_id: thread.gmail_thread_id, classification: thread.classification, qualification_step: thread.qualification_step } }];`;

  // Parse AI Response for Email
  const parseAiNode = wf7.nodes.find(n => n.name === 'Parse AI Response1');
  parseAiNode.name = 'Parse Email AI Response';
  parseAiNode.parameters.jsCode = parseAiNode.parameters.jsCode.replace('whatsapp_chat_id', 'thread_id').replace('extracted.hasPhoto', 'extracted.phone');

  // Skip delay for emails
  wf7.nodes = wf7.nodes.filter(n => !['Calculate Human Delay1', 'Wait — Human Delay1', 'Send WhatsApp Reply via Unipile1'].includes(n.name));

  // Add Gmail Send Reply Node
  const sendEmailNode = {
    "parameters": {
       "resource": "message",
       "operation": "send",
       "subject": "Re: Uw Tuin Project",
       "message": "={{ $node['Parse Email AI Response'].json.ai_reply }}",
       "threadId": "={{ $node['Parse Email AI Response'].json.gmail_thread_id }}",
       "options": {}
    },
    "id": genId(),
    "name": "Send Gmail Reply",
    "type": "n8n-nodes-base.gmail",
    "typeVersion": 2.1,
    "position": [ 0, 400 ],
    "credentials": { "gmailOAuth2": { "id": "HHZP2v5q3JOlG1Zw", "name": "Gmail account" } }
  };
  wf7.nodes.push(sendEmailNode);

  // Update Database Nodes
  const updateDbNode = wf7.nodes.find(n => n.name === 'Update Conversation State1');
  updateDbNode.name = 'Update Email Thread State';
  updateDbNode.parameters.url = '=https://rifktjxmadzfrdclxpfz.supabase.co/rest/v1/email_threads';
  updateDbNode.parameters.queryParameters.parameters = [{ name: 'id', value: '=eq.{{ $json.thread_id }}'}];
  updateDbNode.parameters.jsonBody = `={{ JSON.stringify({ pending_reply: false, qualification_step: $json.currentStep, qualification_complete: $json.qualificationComplete }) }}`;

  // Make connections
  wf7.connections['Schedule Trigger — Every 60s'] = { main: [[{ node: 'Find Pending Email Threads', type: 'main', index: 0 }]] };
  wf7.connections['Find Pending Email Threads'] = { main: [[{ node: 'Filter — Ready Email Threads', type: 'main', index: 0 }]] };
  wf7.connections['Filter — Ready Email Threads'] = { main: [[{ node: 'Get Email Message History', type: 'main', index: 0 }]] };
  wf7.connections['Get Email Message History'] = { main: [[{ node: 'Build AI Prompt (Email)', type: 'main', index: 0 }]] };
  wf7.connections['Build AI Prompt (Email)'] = { main: [[{ node: 'Message a model1', type: 'main', index: 0 }]] };
  wf7.connections['Message a model1'] = { main: [[{ node: 'Code in JavaScript1', type: 'main', index: 0 }]] };
  wf7.connections['Code in JavaScript1'] = { main: [[{ node: 'Parse Email AI Response', type: 'main', index: 0 }]] };
  wf7.connections['Parse Email AI Response'] = { main: [[{ node: 'Send Gmail Reply', type: 'main', index: 0 }]] };
  wf7.connections['Send Gmail Reply'] = { main: [[{ node: 'Update Email Thread State', type: 'main', index: 0 }]] };

  fs.writeFileSync('./7-Email Debounce Processor.json', JSON.stringify(wf7, null, 2));
  console.log("Created 7-Email Debounce Processor.json");

}

run();
