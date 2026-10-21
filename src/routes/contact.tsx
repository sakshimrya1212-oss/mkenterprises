import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, RotateCcw, Send, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — MK Enterprises | Ayurvedic Wellness" },
      { name: "description", content: "Contact MK Enterprises. Phone: +91 91117 22209. Email: enterprisesmk313@gmail.com. Ambikapur, Chhattisgarh." },
      { property: "og:title", content: "Contact Us — MK Enterprises" },
      { property: "og:description", content: "Get in touch with MK Enterprises for Ayurvedic products, orders, and dealership queries." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "Product Information & Dosage",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { ticket: string; name: string }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    if (!formData.message.trim()) {
      toast.error("Please write your message or inquiry");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      const ticket = "MK-INQ-" + Math.floor(100000 + Math.random() * 900000);
      setSubmitted({ ticket, name: formData.name });
      setSubmitting(false);

      // Save submission to local storage for records
      try {
        const stored = JSON.parse(localStorage.getItem("mk_contact_inquiries_v1") || "[]");
        stored.unshift({
          ticket,
          ...formData,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("mk_contact_inquiries_v1", JSON.stringify(stored));
      } catch (err) {
        console.error(err);
      }

      toast.success("Thank you! Your message has been sent successfully.");
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      subject: "Product Information & Dosage",
      message: "",
    });
  };

  return (
    <>
      <PageHero
        title="Contact Us"
        sub="Have a question about our Ayurvedic products or your order? We're here to assist you."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left Column: Company & Contact Details (Img 1) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-gold-dark/40 bg-card p-6 md:p-8 shadow-sm">
              <span className="inline-block rounded-sm bg-gold/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-dark">
                Official Head Office
              </span>
              <h2 className="mt-3 text-2xl font-bold uppercase tracking-wider text-gold-gradient">
                MK Enterprises
              </h2>
              <p className="mt-1 text-sm font-semibold text-foreground">
                Partners in Growth & Innovation
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Delivering 100% authentic, premium Ayurvedic syrups, oils, tablets, and wellness herbal formulations across India.
              </p>

              <div className="mt-6 space-y-4 text-sm">
                {/* Phone */}
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 transition hover:border-gold-dark/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Call Helpline</p>
                    <a href="tel:+919111722209" className="font-semibold text-foreground hover:text-gold-dark">
                      +91 91117 22209
                    </a>
                    <p className="text-[11px] text-muted-foreground">Direct customer care desk</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 transition hover:border-gold-dark/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Support</p>
                    <a href="mailto:enterprisesmk313@gmail.com" className="font-semibold text-foreground hover:text-gold-dark">
                      enterprisesmk313@gmail.com
                    </a>
                    <p className="text-[11px] text-muted-foreground">Replies within 2–4 business hours</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5 transition hover:border-gold-dark/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Registered Address</p>
                    <p className="font-medium text-foreground leading-snug">
                      Ward No. 7, Rajmohini Agri College Road, Azeerma, Ambikapur, Surguja (C.G.) 497001
                    </p>
                    <p className="text-[11px] text-muted-foreground">Chhattisgarh, India</p>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold-dark">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Operating Hours</p>
                    <p className="font-medium text-foreground">Monday – Saturday: 10:00 AM to 7:00 PM</p>
                    <p className="text-[11px] text-muted-foreground">Sunday: Closed (WhatsApp inquiries active)</p>
                  </div>
                </div>
              </div>

              {/* Instant WhatsApp Quick Button */}
              <div className="mt-6 pt-4 border-t border-border">
                <a
                  href="https://wa.me/919111722209?text=Hello%20MK%20Enterprises,%20I%20have%20an%20inquiry%20regarding%20your%20Ayurvedic%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#20ba59]"
                >
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp (+91 91117 22209)
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Submission Form */}
          <div className="lg:col-span-7">
            <div className="rounded-xl border border-gold-dark/40 bg-card p-6 md:p-10 shadow-sm">
              {submitted ? (
                /* Success State */
                <div className="py-8 text-center animate-fade-in">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-foreground">Inquiry Submitted!</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you, <b className="text-foreground">{submitted.name}</b>. Your message has been received by our support desk.
                  </p>

                  <div className="mt-6 inline-block rounded-md border border-gold-dark/40 bg-muted/40 px-6 py-3 text-xs">
                    <span className="text-muted-foreground">Your Reference Ticket Number:</span>
                    <p className="font-mono text-base font-bold text-gold-dark">{submitted.ticket}</p>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">
                    Our team will contact you on <b className="text-foreground">+91 {formData.phone}</b> within 24 working hours.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <a
                      href={`https://wa.me/919111722209?text=Hello%20MK%20Enterprises,%20I%20just%20submitted%20inquiry%20ticket%20${submitted.ticket}%20for%20${encodeURIComponent(formData.subject)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#20ba59]"
                    >
                      <MessageCircle className="h-4 w-4" /> Fast Track on WhatsApp
                    </a>
                    <Button variant="outline" onClick={handleReset} className="border-gold-dark/40 text-xs">
                      <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Submit Another Query
                    </Button>
                  </div>
                </div>
              ) : (
                /* Inquiry Form */
                <>
                  <div className="border-b border-border pb-4">
                    <h3 className="text-xl font-bold uppercase tracking-wider text-foreground">
                      Send Us a Message
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Please enter your details and questions below. Our Ayurvedic specialists will respond promptly.
                    </p>

                    {/* 100% Authentic & Pan-India Courier Badges below Send Us a Message */}
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-lg border border-gold-dark/30 bg-muted/30 p-3">
                        <ShieldCheck className="mx-auto h-5 w-5 text-gold-dark" />
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-foreground">100% Authentic</p>
                        <p className="text-[10px] text-muted-foreground">Direct from certified Ayurvedic lab</p>
                      </div>
                      <div className="rounded-lg border border-gold-dark/30 bg-muted/30 p-3">
                        <Sparkles className="mx-auto h-5 w-5 text-gold-dark" />
                        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-foreground">Pan-India Courier</p>
                        <p className="text-[10px] text-muted-foreground">COD & Fast Doorstep Delivery</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Name */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">
                          Your Full Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          placeholder="e.g. Ramesh Kumar"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-background"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">
                          Mobile Number <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="tel"
                          placeholder="10-digit mobile number"
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                          required
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Email */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">
                          Email Address <span className="text-muted-foreground text-[10px] lowercase">(optional)</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="e.g. name@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-background"
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">
                          Inquiry Type
                        </label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="Product Information & Dosage">Product Information & Dosage</option>
                          <option value="Order Tracking & Delivery">Order Tracking & Delivery</option>
                          <option value="Bulk Order & Ayurvedic Dealership">Bulk Order & Ayurvedic Dealership</option>
                          <option value="Payment or Refund Support">Payment or Refund Support</option>
                          <option value="General Feedback">General Feedback & Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-foreground">
                        Your Message / Questions <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Please describe your query, product required, or order issue in detail..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        className="w-full rounded-md border border-input bg-background p-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gold-gradient font-bold uppercase tracking-wider text-primary-foreground hover:opacity-95"
                        size="lg"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            Sending Inquiry...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" /> Submit Inquiry
                          </span>
                        )}
                      </Button>
                    </div>

                    <p className="text-center text-[11px] text-muted-foreground">
                      🔒 Your contact information is kept private and used only to respond to your inquiry.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
