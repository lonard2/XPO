"use client";

import * as React from "react";
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Award,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Search,
  Globe2,
  Users,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { type ArchetypeViewProps } from "./IndustrialB2BView";

export function EducationEdTechView({ event, locale = "en", onSelectTier }: ArchetypeViewProps) {
  const [scholarshipDrawerOpen, setScholarshipDrawerOpen] = React.useState(false);
  const [gpa, setGpa] = React.useState("3.8");
  const [targetDegree, setTargetDegree] = React.useState("Master of Science (STEM)");
  const [calcResult, setCalcResult] = React.useState(false);

  // University Stalls & Academic Innovation Hub
  const universityDirectory = [
    {
      id: "edu-01",
      name: "Tokyo Institute of Advanced Technology & AI",
      location: "Tokyo, Japan",
      qsRank: "Top 50 Global (Engineering)",
      programs: "Autonomous Robotics, Quantum Computing & Next-Gen Energy",
      booth: "Hall 1 - Stall 102",
      consultation: "Faculty Admissions Advisor On-Site",
    },
    {
      id: "edu-02",
      name: "Universitas Indonesia Engineering & Health Sciences",
      location: "Depok / Jakarta, Indonesia",
      qsRank: "National Tier 1 Research Institution",
      programs: "Biomedical Systems, Civil Infrastructure & Marine Tech",
      booth: "Hall 2 - Stall 214",
      consultation: "LPDP & Government Scholarship Desk",
    },
    {
      id: "edu-03",
      name: "Global Consortium of European Tech Universities",
      location: "Frankfurt / London / Zurich",
      qsRank: "World Leading Technical R&D",
      programs: "Aerospace Avionics, Sustainable PropTech & AI Ethics",
      booth: "Hall 3 - Stall 305",
      consultation: "Erasmus+ & International Exchange Desk",
    },
  ];

  return (
    <div className="space-y-12">
      {/* 1. Category Mission Statement */}
      <section className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/20 via-card to-background p-6 sm:p-8 backdrop-blur-sm shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 border border-violet-500/20">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-500">
                Education, EdTech & Academic Summit
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              World University Fairs, Scholarship Grants & STEM Innovation
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Explore global university rankings, consult directly with academic faculty admissions teams, calculate scholarship grant eligibility, and discover next-generation learning technologies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Button
              onClick={() => {
                setCalcResult(false);
                setScholarshipDrawerOpen(true);
              }}
              size="lg"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-md min-h-[44px]"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Calculate Scholarship Grant
            </Button>
            <div className="text-xs text-muted-foreground text-center lg:text-right">
              Verified scholarship endowments & institutional grants
            </div>
          </div>
        </div>
      </section>

      {/* 2. University Directory & Stalls */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-500 uppercase tracking-wider mb-1">
            <BookOpen className="h-4 w-4" />
            <span>Academic Institutions</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Featured University Stalls & Research Pavilions
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {universityDirectory.map((uni) => (
            <Card key={uni.id} className="border-border/80 bg-card hover:border-violet-500/40 transition-all shadow-xs flex flex-col justify-between">
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="border-violet-500/30 text-violet-500 bg-violet-500/10 text-xs font-semibold">
                    {uni.location}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-muted-foreground">{uni.qsRank}</span>
                </div>
                <CardTitle className="text-lg font-bold text-foreground leading-snug">{uni.name}</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">{uni.programs}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/80 shrink-0" />
                    <span>{uni.booth}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Clock className="h-3.5 w-3.5 text-violet-500 shrink-0" />
                    <span>{uni.consultation}</span>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setCalcResult(false);
                    setScholarshipDrawerOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full border-violet-500/30 hover:bg-violet-500/10 text-foreground font-semibold min-h-[40px]"
                >
                  <Award className="h-3.5 w-3.5 mr-1.5 text-violet-500" />
                  Apply for Faculty Interview
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Scholarship Calculator Drawer */}
      <Drawer
        open={scholarshipDrawerOpen}
        onClose={() => setScholarshipDrawerOpen(false)}
        title="Institutional Scholarship & Grant Calculator"
        description="Estimate merit-based tuition subsidy and research stipend eligibility across participating universities."
      >
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Current Academic GPA (Scale of 4.0)
              </label>
              <input
                type="text"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Target Degree Program
              </label>
              <select
                value={targetDegree}
                onChange={(e) => setTargetDegree(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground font-medium"
              >
                <option>Bachelor of Science (Engineering / Robotics)</option>
                <option>Master of Science (STEM / Artificial Intelligence)</option>
                <option>Doctoral Ph.D. Fellowship (Clean Energy & Quantum)</option>
              </select>
            </div>

            <Button
              onClick={() => setCalcResult(true)}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold"
            >
              Calculate Grant Coverage
            </Button>
          </div>

          {calcResult && (
            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-violet-500">SCHOLARSHIP ELIGIBILITY: TIER 1</span>
                <Badge variant="outline" className="border-violet-500/30 text-violet-500 bg-violet-500/10 text-xs">
                  Merit Verified
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Tuition Waiver</span>
                  <span className="font-semibold text-foreground">75% - 100% Full Waiver</span>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/60">
                  <span className="text-muted-foreground block text-[11px]">Research Stipend</span>
                  <span className="font-semibold text-foreground">Equivalent to $1,800/mo</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Visit the Academic Admissions Lounge at Hall 1 with your official transcripts for immediate on-site endorsement.
              </p>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
}
