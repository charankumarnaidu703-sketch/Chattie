const fs = require('fs');

async function run() {
  const wf1b = JSON.parse(fs.readFileSync('./Workflow 1B — Debounce Processor.json', 'utf8'));
  
  // 1. Update the AI Prompt
  const buildPromptNode = wf1b.nodes.find(n => n.name === 'Message a model1');
  if (buildPromptNode) {
    let systemPrompt = buildPromptNode.parameters.options.system.toString();
    
    // Add Step 5: Email if not present
    if (!systemPrompt.includes('Step 5: EMAIL')) {
      systemPrompt = systemPrompt.replace(
        'Step 4: PHOTOS — Ask them to send photos of the current situation',
        'Step 4: PHOTOS — Ask them to send photos of the current situation\\nStep 5: EMAIL — Ask for their email address. Frame it as: "Can you also share your email address so we can send the quote later?"'
      );
      
      // Update the step complete note
      systemPrompt = systemPrompt.replace(
        'ALL 4 steps have already been collected',
        'ALL 5 steps have already been collected'
      );
      
      // Update the JSON Output structure
      systemPrompt = systemPrompt.replace(
        '     "hasPhoto": true or false',
        '     "hasPhoto": true or false,\\n     "email": "extracted email or null"'
      );
      
      buildPromptNode.parameters.options.system = systemPrompt;
    }
  }

  // 2. Update the Parse AI Response node JS to extract it
  const parseNode = wf1b.nodes.find(n => n.name === 'Parse AI Response1');
  if (parseNode) {
    let js = parseNode.parameters.jsCode;
    if (!js.includes('extracted_email:')) {
      js = js.replace(
        '    extracted_hasPhoto:     aiOutput.extracted.hasPhoto   || false,',
        '    extracted_hasPhoto:     aiOutput.extracted.hasPhoto   || false,\\n    extracted_email:        aiOutput.extracted.email      || null,'
      );
      parseNode.parameters.jsCode = js;
    }
  }
  
  fs.writeFileSync('./Workflow 1B — Debounce Processor.json', JSON.stringify(wf1b, null, 2));
  console.log("Updated Workflow 1B — Debounce Processor.json");
}

run();
