"use client";

import * as React from "react";
import {
  Stethoscope,
  Award,
  FileCheck,
  BookOpen,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ExternalLink,
  ShieldAlert,
  Building,
  GraduationCap,
  Ticket,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { formatCurrency, type SupportedCurrency } from "@/lib/i18n/formatters";
import type { ArchetypeViewProps } from "./IndustrialB2BView";

export function MedicalSymposiumView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [expandedAbstract, setExpandedAbstract] = React.useState<number | null>(0);
  const [abstractFilter, setAbstractFilter] = React.useState("");
  const [claimedCme, setClaimedCme] = React.useState(false);

  // Sample peer-reviewed abstracts
  const abstracts = [
    {
      id: 1,
      title: "Phase III Efficacy of Next-Generation SGLT2 Inhibitors in Cardio-Renal Syndromes",
      authors: "Prof. Dr. Sarah Jenkins, MD, FACC; Dr. Bambang Sudiro, Sp.JP(K); Dr. Akira Tanaka, MD, PhD",
      institution: "Asia-Pacific Cardio-Renal Research Consortium",
      doi: "10.1016/j.apcr.2026.04.108",
      cmeCredits: 2.5,
      abstractText:
        "Background: Cardio-renal metabolic syndrome presents high hospitalization rates in aging demographics. Methods: Double-blind, randomized controlled trial across 34 clinical centers (n=4,280). Results: Primary composite endpoint showed a 32% relative risk reduction (HR 0.68, 95% CI 0.58-0.80, p<0.001) in heart failure hospitalizations over 24 months.",
    },
    {
      id: 2,
      title: "Novel Biomarkers for Early Detection of Multi-Drug Resistant Pulmonary Infections",
      authors: "Dr. Elena Rostova, MD, PhD; Dr. Hiroshi Sato, Sp.P(K); Dr. Clara Lin, MBBS",
      institution: "International Center for Tropical Infectious Diseases",
      doi: "10.1056/j.ictid.2026.03.042",
      cmeCredits: 2.0,
      abstractText:
        "Background: Rapid diagnostic differentiation in critical care units. Methods: Multiplex PCR and microfluidic biomarker profiling on 1,120 ICU admissions. Results: Sensitivity reached 96.4% with specificity of 98.1%, reducing time-to-targeted-antibiotic from 48h to 2.4h.",
    },
    {
      id: 3,
      title: "AI-Augmented Robotic Endovascular Interventions: Multi-Center Registry Analysis",
      authors: "Prof. Michael Sterling, MD, FRCS; Dr. Dian Kartika, Sp.BS(K)",
      institution: "Global Neurosurgical & Vascular Alliance",
      doi: "10.1038/s41591-026-03120-x",
      cmeCredits: 3.0,
      abstractText:
        "Background: Catheter navigation precision during complex intracranial aneurysm coiling. Results: Average fluoroscopy exposure time decreased by 41% with 0% vessel perforation in 620 consecutive procedures.",
    },
  ];

  const filteredAbstracts = abstracts.filter(
    (item) =>
      item.title.toLowerCase().includes(abstractFilter.toLowerCase()) ||
      item.authors.toLowerCase().includes(abstractFilter.toLowerCase()) ||
      item.institution.toLowerCase().includes(abstractFilter.toLowerCase())
  );

  return (
    <div className="space-y-12 font-serif">
      {/* 1. CME & Clinical Accreditation Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-sans font-bold text-[var(--archetype-primary)] tracking-wide uppercase">
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
            <span>Clinical Congress & Scientific Research Congress</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            Advancing Evidence-Based Medicine & Clinical Practice
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-sans">
            {event.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="archetype"
              onClick={() => {
                const el = document.getElementById("abstract-reader");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-sans font-semibold shadow-md"
            >
              <BookOpen className="h-4 w-4" />
              Read Peer-Reviewed Abstracts ({abstracts.length})
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                const el = document.getElementById("cme-credits");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="gap-2 text-xs font-sans"
            >
              <Award className="h-4 w-4 text-[var(--archetype-accent)]" />
              CME Certificate (Up to 18.5 Credits)
            </Button>
          </div>
        </div>

        {/* CME Credit Tracker Card */}
        <Card id="cme-credits" className="border-border bg-card shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" size="sm" className="font-sans text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                Accredited Congress
              </Badge>
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <CardTitle className="text-lg font-sans">CME Credit Eligibility</CardTitle>
            <CardDescription className="text-xs font-sans">
              Accredited by IDI (Ikatan Dokter Indonesia) & ACCME.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs font-sans">
            <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
              <div className="flex justify-between items-center font-semibold">
                <span>Total Congress Credits:</span>
                <span className="text-sm font-bold text-foreground">18.5 SKP / CME</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Requires attendance scan at 80% or more plenary symposiums and workshop modules.
              </p>
            </div>

            {claimedCme ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>CME Verification registered. Certificate available upon completion.</span>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setClaimedCme(true)}
                className="w-full text-xs gap-1.5"
              >
                <FileCheck className="h-3.5 w-3.5" />
                Register CME Physician License ID
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* 2. Peer-Reviewed Research Abstract Reader */}
      <section id="abstract-reader" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
              <BookOpen className="h-5 w-5 text-[var(--archetype-primary)]" />
              Scientific Abstracts & Clinical Trials
            </h3>
            <p className="text-xs font-sans text-muted-foreground">
              Search peer-reviewed papers presented during oral and poster breakout sessions.
            </p>
          </div>
          <div className="relative w-full sm:w-72 font-sans">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by topic, author, institution..."
              value={abstractFilter}
              onChange={(e) => setAbstractFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-background border border-border focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredAbstracts.map((abs) => {
            const isExpanded = expandedAbstract === abs.id;
            return (
              <Card key={abs.id} className="border-border/80 transition-all overflow-hidden">
                <div
                  onClick={() => setExpandedAbstract(isExpanded ? null : abs.id)}
                  className="p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="archetype" size="sm" className="font-sans text-[10px]">
                        {abs.cmeCredits} CME Credits
                      </Badge>
                      <span className="text-[11px] font-sans text-muted-foreground font-mono">
                        DOI: {abs.doi}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground">{abs.title}</h4>
                    <p className="text-xs font-sans text-muted-foreground">{abs.authors}</p>
                    <p className="text-[11px] font-sans text-[var(--archetype-primary)] font-medium">
                      {abs.institution}
                    </p>
                  </div>
                  <button className="p-1 rounded-md text-muted-foreground" aria-label="Toggle details">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-border/50 bg-muted/10 space-y-3 font-sans text-xs animate-fade-in">
                    <div className="p-3 bg-background rounded-md border border-border/80 leading-relaxed text-muted-foreground">
                      {abs.abstractText}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Peer-reviewed by Congress Scientific Advisory Committee</span>
                      <span className="text-[var(--archetype-primary)] hover:underline cursor-pointer flex items-center gap-1">
                        Download Full PDF <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Scientific Plenary Symposia Schedule */}
      {event.agendaItems.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Clock className="h-5 w-5 text-[var(--archetype-primary)]" />
            Symposium Schedule & Plenary Lectures
          </h3>
          <div className="space-y-3 font-sans">
            {event.agendaItems.map((agenda) => (
              <div
                key={agenda.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-card border border-border gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm">
                      {agenda.track || "Plenary Symposium"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {agenda.location}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-foreground">{agenda.title}</h4>
                  {agenda.speakerName && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5 text-[var(--archetype-primary)]" />
                      <span className="font-semibold text-foreground">{agenda.speakerName}</span>
                      {agenda.speakerRole && <span>, {agenda.speakerRole}</span>}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground sm:text-right shrink-0">
                  <p className="font-mono font-medium text-foreground">
                    {new Date(agenda.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                    {new Date(agenda.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Ticket Tiers & Medical Credentials Pass Selection */}
      <section id="tickets-section" className="space-y-6 pt-4 border-t border-border">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2 font-sans">
            <Ticket className="h-5 w-5 text-[var(--archetype-primary)]" />
            Medical Registration & Delegate Credentials
          </h3>
          <p className="text-xs font-sans text-muted-foreground">
            Credentialed rates for medical specialists, fellows, residents, and allied healthcare professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
          {event.ticketTiers.map((tier) => {
            let benefits: string[] = [];
            try {
              benefits = JSON.parse(tier.benefitsJson);
            } catch {
              benefits = ["Full symposium and exhibition access", "CME certificate issuance", "Symposium luncheon voucher"];
            }

            return (
              <Card key={tier.id} className="flex flex-col border-border/80 hover:border-primary transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <Badge variant="secondary" size="sm">
                      {tier.capacity - tier.soldCount} Badges Left
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-foreground">
                      {tier.price > 0
                        ? formatCurrency(tier.price, (tier.currency as SupportedCurrency) || "IDR", locale)
                        : "Complimentary Pass"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 mt-auto">
                    <Button
                      variant="archetype"
                      className="w-full gap-2 font-semibold"
                      onClick={() => onSelectTier?.(tier.id)}
                    >
                      <Ticket className="h-4 w-4" />
                      Select Delegate Pass
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
