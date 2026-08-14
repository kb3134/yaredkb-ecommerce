import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle2, AlertCircle, Sparkles, MessageSquare } from 'lucide-react';
import { ContactMessage } from '../types';

interface ContactUsPageProps {
  onSubmitContactMessage: (msgData: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => Promise<boolean> | boolean;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ onSubmitContactMessage }) => {
  const [fullName, setFullName] = useState('');
  const [subject, setSubject] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    // Form Validation
    if (!fullName.trim()) {
      setErrorBanner('Please enter your full name.');
      return;
    }
    if (!subject.trim()) {
      setErrorBanner('Please enter a subject for your message.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorBanner('Please enter a valid email address.');
      return;
    }
    if (!message.trim()) {
      setErrorBanner('Please write your message.');
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onSubmitContactMessage({
        fullName: fullName.trim(),
        subject: subject.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim()
      });

      if (success !== false) {
        setSuccessBanner(true);
        setFullName('');
        setSubject('');
        setEmail('');
        setPhone('');
        setMessage('');
      } else {
        setErrorBanner('Failed to send message. Please try again.');
      }
    } catch (err) {
      setErrorBanner('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF8F3] text-[#1A1817] min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
        
        {/* Page Title & Subtitle */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1A1817] text-[#D4AF37] border border-[#D4AF37]/50 text-[11px] font-serif font-bold tracking-widest uppercase shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATELIER CLIENT CARE & INQUIRIES</span>
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#1A1817]">
            Get in Touch with Yared Tibeb
          </h1>
          
          <p className="text-sm sm:text-base text-gray-700 font-sans leading-relaxed">
            Whether you wish to schedule an in-person bespoke fitting in Addis Ababa, inquire about our handwoven Habesha Kemis gowns, or request worldwide insured shipping support, our client care team is at your service.
          </p>
        </div>

        {/* Success Alert Banner */}
        {successBanner && (
          <div className="max-w-4xl mx-auto bg-emerald-950 text-emerald-100 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl flex items-start gap-4 animate-scale-up">
            <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h3 className="font-serif font-bold text-lg text-emerald-300">
                Message Received!
              </h3>
              <p className="text-sm text-emerald-100 font-sans leading-relaxed">
                Thank you! Your message has been sent successfully. We will contact you soon.
              </p>
              <button
                onClick={() => setSuccessBanner(false)}
                className="mt-2 text-xs font-serif font-bold uppercase tracking-wider text-emerald-400 hover:text-white underline cursor-pointer"
              >
                Send another inquiry
              </button>
            </div>
          </div>
        )}

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
          
          {/* LEFT SIDE: Contact Information */}
          <div className="lg:col-span-5 bg-[#1F1915] text-[#FDFBF7] border-2 border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
            
            {/* Background Decorative Accent */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-2 border-b border-[#D4AF37]/20 pb-5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">ATELIER CONTACT INFO</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white">
                Studio & Headquarters
              </h2>
              <p className="text-xs text-gray-400 font-sans">
                Our flagship boutique & traditional handloom atelier in Addis Ababa.
              </p>
            </div>

            {/* Info Items List */}
            <div className="space-y-6">
              
              {/* 1. Address */}
              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-[#2D241E] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:bg-[#D4AF37] group-hover:text-[#1A1817] transition-all duration-300 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#D4AF37]">
                    Address
                  </h4>
                  <p className="text-sm font-sans text-gray-200 leading-relaxed">
                    22, Bedria City Mall, Ground Floor, No. 14,<br />
                    Addis Ababa, Ethiopia
                  </p>
                </div>
              </div>

              {/* 2. Phone Number */}
              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-[#2D241E] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:bg-[#D4AF37] group-hover:text-[#1A1817] transition-all duration-300 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#D4AF37]">
                    Phone / WhatsApp Hotline
                  </h4>
                  <p className="text-sm font-sans text-gray-200">
                    <a href="tel:+251923095380" className="hover:text-[#D4AF37] transition font-semibold">
                      +251 92 309 5380
                    </a>
                  </p>
                  <p className="text-[11px] text-gray-400 font-sans">
                    Available for phone, WhatsApp & Telegram consultations
                  </p>
                </div>
              </div>

              {/* 3. Email Address */}
              <div className="flex items-start gap-4 group">
                <div className="w-11 h-11 rounded-2xl bg-[#2D241E] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 group-hover:bg-[#D4AF37] group-hover:text-[#1A1817] transition-all duration-300 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#D4AF37]">
                    Official Email Address
                  </h4>
                  <p className="text-sm font-sans text-gray-200">
                    <a href="mailto:info@yaredtibeb.com" className="hover:text-[#D4AF37] transition font-semibold">
                      info@yaredtibeb.com
                    </a>
                  </p>
                  <p className="text-[11px] text-gray-400 font-sans">
                    Direct inquiries & bespoke fitting requests
                  </p>
                </div>
              </div>

            </div>

            {/* Direct Instant Action Badge */}
            <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#D4AF37]">DHL Insured Worldwide Shipping</span>
              <span className="font-serif italic text-gray-300">Addis Ababa, Ethiopia</span>
            </div>

          </div>

          {/* RIGHT SIDE: Contact Form */}
          <div className="lg:col-span-7 bg-[#FDFBF7] border border-[#E5DFD3] rounded-3xl p-6 sm:p-10 shadow-xl space-y-6">
            
            <div className="space-y-2 border-b border-[#E5DFD3] pb-4">
              <h2 className="font-serif text-2xl font-bold text-[#1A1817]">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 font-sans">
                Please complete the form below. Our couture consultants will get back to you promptly.
              </p>
            </div>

            {/* Error Banner */}
            {errorBanner && (
              <div className="bg-rose-50 border border-rose-300 text-rose-800 rounded-xl p-4 text-xs font-semibold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorBanner}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1A1817]">
                    Full Name <span className="text-[#8B0000]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Bikila"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-[#1A1817] shadow-xs transition"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1A1817]">
                    Email Address <span className="text-[#8B0000]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. abebe@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-[#1A1817] shadow-xs transition"
                  />
                </div>

              </div>

              {/* Row 2: Subject & Phone (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1A1817]">
                    Subject <span className="text-[#8B0000]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bespoke Fitting Inquiry / Order Question"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-[#1A1817] shadow-xs transition"
                  />
                </div>

                {/* Phone Number (Optional) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1A1817]">
                    Phone Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +251 91 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-[#1A1817] shadow-xs transition"
                  />
                </div>

              </div>

              {/* Row 3: Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-serif font-bold uppercase tracking-wider text-[#1A1817]">
                  Your Message <span className="text-[#8B0000]">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="How can our master weavers and fitting team assist you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C5A059] focus:border-[#C5A059] text-sm text-[#1A1817] shadow-xs transition leading-relaxed resize-y"
                />
              </div>

              {/* Submit Button matching Yared Tibeb Primary Style */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1A1817] hover:bg-[#8B0000] text-[#D4AF37] hover:text-white font-serif font-bold text-xs sm:text-sm tracking-widest uppercase rounded-xl border border-[#D4AF37] transition duration-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#D4AF37]" />
                    <span>SEND MESSAGE</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-gray-500 font-sans text-center">
                We respect your privacy. Your information is protected and used solely to respond to your inquiry.
              </p>

            </form>

          </div>

        </div>

        {/* Studio Location Map Section */}
        <div className="max-w-6xl mx-auto bg-[#1F1915] border-2 border-[#D4AF37]/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <MapPin className="w-5 h-5" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest">VISIT OUR FLAGSHIP BOUTIQUE</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Check Out Our Location on Map
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-sans">
                Bedria City Mall, Ground Floor, Haya Hulet, Addis Ababa, Ethiopia
              </p>
            </div>
            <a 
              href="https://maps.google.com/?q=Bedria+City+Mall+Haya+Hulet+Addis+Ababa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#D4AF37] hover:bg-white text-[#1A1817] font-serif font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-md self-start sm:self-auto"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="relative w-full rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-inner bg-[#120E0C] aspect-[16/9] lg:aspect-[21/9]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.6116185802666!2d38.78582688601432!3d9.00783784189534!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85ce3381afd9%3A0x6fd3435ea2423db3!2zQmVkcmlhIENpdHkgTWFsbCBsIEhheWEgSHVsZXQgbCDhiaDhi7XhiKrhi6sg4Yiy4YmyIOGInuGIjSBsIOGIg-GLqyDhiIHhiIjhibU!5e0!3m2!1sen!2set!4v1786173207023!5m2!1sen!2set"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'contrast(1.05) saturate(1.1)' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Yared Tibeb Studio Location - Bedria City Mall, Haya Hulet"
              className="w-full h-full min-h-[380px]"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
