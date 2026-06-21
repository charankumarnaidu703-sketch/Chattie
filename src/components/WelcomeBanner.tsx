'use client';

import { useState, useEffect } from 'react';
import { Sparkles, X, MessageSquare, Mail, Phone, Clock } from 'lucide-react';

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('chattie_welcome_dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('chattie_welcome_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-surface-container-lowest rounded-3xl border border-primary/20 p-6 md:p-8 shadow-ambient overflow-hidden animate-slide-in">
      {/* Background shape */}
      <div className="absolute right-0 bottom-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 top-0 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl pointer-events-none" />

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-container-high/50 text-outline hover:text-on-surface-variant transition-colors cursor-pointer"
        aria-label="Welkomstbanner sluiten"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      <div className="flex items-start gap-4 pr-6">
        <div className="p-3 bg-primary/10 text-primary rounded-2xl flex-shrink-0">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h3 className="font-headline font-extrabold text-xl text-on-background tracking-tight">
            Welkom bij uw Chattie CRM! 🌿
          </h3>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-2xl">
            Dit dashboard helpt u bij het beheren van al uw klantcontacten, offerte-aanvragen en projectcommunicatie voor uw hoveniersbedrijf. Hier is een snelle handleiding om aan de slag te gaan:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-4 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-2 text-primary mb-1">
            <MessageSquare className="h-4.5 w-4.5" />
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">Gesprekken</h4>
          </div>
          <p className="font-body text-[12px] text-on-surface-variant/80 leading-relaxed">
            WhatsApp-chats worden automatisch door de AI gekwalificeerd. Pauzeer de bot om handmatig te antwoorden.
          </p>
        </div>

        <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-4 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-2 text-tertiary mb-1">
            <Mail className="h-4.5 w-4.5" />
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">E-mails</h4>
          </div>
          <p className="font-body text-[12px] text-on-surface-variant/80 leading-relaxed">
            Offertes en vragen worden automatisch gecategoriseerd zodat u direct de juiste opvolging kunt doen.
          </p>
        </div>

        <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-4 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <Phone className="h-4.5 w-4.5" />
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">Bellijst</h4>
          </div>
          <p className="font-body text-[12px] text-on-surface-variant/80 leading-relaxed">
            Leg telefoongesprekken en klantafspraken vast met de geïntegreerde n8n call notes widget.
          </p>
        </div>

        <div className="bg-surface-container-lowest/80 backdrop-blur-sm p-4 rounded-2xl border border-outline-variant/10">
          <div className="flex items-center gap-2 text-primary-container mb-1">
            <Clock className="h-4.5 w-4.5" />
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider">Follow-ups</h4>
          </div>
          <p className="font-body text-[12px] text-on-surface-variant/80 leading-relaxed">
            Houd geplande opvolgingen en taken in de gaten zodat u nooit een potentiële klant vergeet.
          </p>
        </div>
      </div>
    </div>
  );
}
