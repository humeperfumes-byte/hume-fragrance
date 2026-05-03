"use client";

import { SectionAttribution } from "@/db/schema";
import { Progress } from "@/components/ui/progress";
import { MousePointer2, Eye, Award } from "lucide-react";

export function SectionPerformance({ sections }: { sections: SectionAttribution[] }) {
  return (
    <div className="space-y-4">
      {sections.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center">
          <p className="text-sm text-white/20 italic">Gathering attribution data...</p>
        </div>
      ) : (
        sections.map((section, index) => {
          const interactionRate = section.views > 0 
            ? Math.round((section.interactions / section.views) * 100) 
            : 0;
            
          return (
            <div 
              key={section.id} 
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 hover:bg-white/[0.05] transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold mb-1">
                    Rank #{index + 1}
                  </span>
                  <h4 className="text-base font-serif text-white group-hover:text-primary transition-colors capitalize">
                    {section.sectionName.replace("_", " ")}
                  </h4>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1 text-primary">
                    <Award className="h-3 w-3" />
                    <span className="text-lg font-serif">{section.attributionScore}</span>
                  </div>
                  <span className="text-[8px] uppercase tracking-widest text-primary/40 font-bold">Credit Score</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/5">
                    <Eye className="h-3 w-3 text-white/30" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/80">{section.views}</p>
                    <p className="text-[8px] uppercase tracking-tighter text-white/20">Views</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/5">
                    <MousePointer2 className="h-3 w-3 text-white/30" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/80">{section.interactions}</p>
                    <p className="text-[8px] uppercase tracking-tighter text-white/20">Interactions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[8px] uppercase tracking-widest font-bold text-white/20">
                  <span>Interaction Rate</span>
                  <span className="text-white/40">{interactionRate}%</span>
                </div>
                <Progress value={interactionRate} className="h-1 bg-white/5" indicatorClassName="bg-white/10" />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
