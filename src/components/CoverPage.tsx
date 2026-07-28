import React from 'react';

interface CoverPageProps {
  projectName: string;
  designPhilosophy: string;
  applicableCodes: string;
  designDischarge: string;
  ventConfiguration: string;
  foundationLevel: string;
  sbc: string;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  projectName,
  designPhilosophy,
  applicableCodes,
  designDischarge,
  ventConfiguration,
  foundationLevel,
  sbc,
}) => {
  return (
    <div 
      className="relative w-full h-[297mm] flex flex-col justify-center items-center"
      style={{ 
        backgroundColor: 'rgb(0, 15, 45)',
        backgroundImage: `
          linear-gradient(135deg, rgba(245, 180, 0, 0.1) 0%, transparent 50%),
          linear-gradient(225deg, rgba(245, 180, 0, 0.05) 0%, transparent 50%)
        `
      }}
    >
      {/* Gold Border - 3 layers */}
      <div className="absolute inset-[7mm] border-[1.2pt] border-[rgb(245,180,0)]" />
      <div className="absolute inset-[8mm] border-[0.5pt] border-[rgb(245,180,0)] opacity-80" />
      <div className="absolute inset-[8.5mm] border-[0.3pt] border-[rgb(245,180,0)] opacity-60" />

      {/* Header */}
      <div className="text-center mt-16">
        <div className="text-[rgb(245,180,0)] text-[9pt] font-bold tracking-widest mb-2">
          GOVERNMENT OF INDIA
        </div>
        <div className="text-[rgb(245,180,0)] text-[9pt] font-bold tracking-widest">
          ROADS & BUILDINGS DEPARTMENT
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center mt-12">
        <h1 className="text-white text-[20pt] font-bold tracking-wide">
          DETAILED DESIGN REPORT
        </h1>
        <h2 className="text-[rgb(245,180,0)] text-[14pt] font-semibold mt-4">
          VENTED SUBMERSIBLE CAUSEWAY
        </h2>
      </div>

      {/* Project Info Box */}
      <div className="mt-16 bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-[rgb(245,180,0)]/30">
        <div className="grid grid-cols-2 gap-x-16 gap-y-4">
          <div>
            <div className="text-[rgb(200,200,200)] text-[7pt] uppercase tracking-wide">Name of Work</div>
            <div className="text-white text-[10pt] font-semibold mt-1">{projectName}</div>
          </div>
          <div>
            <div className="text-[rgb(200,200,200)] text-[7pt] uppercase tracking-wide">Design Philosophy</div>
            <div className="text-white text-[10pt] font-semibold mt-1">{designPhilosophy}</div>
          </div>
          <div>
            <div className="text-[rgb(200,200,200)] text-[7pt] uppercase tracking-wide">Applicable Codes</div>
            <div className="text-white text-[10pt] font-semibold mt-1">{applicableCodes}</div>
          </div>
          <div>
            <div className="text-[rgb(200,200,200)] text-[7pt] uppercase tracking-wide">Design Discharge</div>
            <div className="text-white text-[10pt] font-semibold mt-1">{designDischarge}</div>
          </div>
          <div>
            <div className="text-[rgb(200,200,200)] text-[7pt] uppercase tracking-wide">Vent Configuration</div>
            <div className="text-white text-[10pt] font-semibold mt-1">{ventConfiguration}</div>
          </div>
          <div>
            <div className="text-[rgb(200,200,200)] text-[7pt] uppercase tracking-wide">Foundation Level</div>
            <div className="text-white text-[10pt] font-semibold mt-1">{foundationLevel}</div>
          </div>
          <div className="col-span-2">
            <div className="text-[rgb(200,200,200)] text-[7pt] uppercase tracking-wide">Safe Bearing Capacity (SBC)</div>
            <div className="text-white text-[10pt] font-semibold mt-1">{sbc}</div>
          </div>
        </div>
      </div>

      {/* Contents List */}
      <div className="mt-12 text-center">
        <div className="text-[rgb(245,180,0)] text-[8pt] font-semibold mb-4 tracking-wide">
          CONTENTS
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-white text-[7pt]">
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">1.</span>
            <span>Design Philosophy & Scope</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">8.</span>
            <span>General Loading Pattern</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">2.</span>
            <span>Hydraulic Particulars & Stream Survey Data</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">9.</span>
            <span>Design of Abutments</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">3.</span>
            <span>Discharge Calculations</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">10.</span>
            <span>Stability Checks — Overturning & Sliding</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">4.</span>
            <span>Ventway Calculations & Fixation of RTL</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">11.</span>
            <span>Design of Strip Footing (RCC)</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">5.</span>
            <span>Afflux Calculations</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">12.</span>
            <span>Design of Piers</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">6.</span>
            <span>Scour Depth & Foundation Level</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">13.</span>
            <span>Design of Face Walls</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">7.</span>
            <span>Design of Protection Works & Launching Aprons</span>
          </div>
          <div className="flex items-center">
            <span className="text-[rgb(245,180,0)] mr-2">14.</span>
            <span>Summary of Results & Compliance</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <div className="text-[rgb(150,150,150)] text-[6pt]">
          Prepared in accordance with IRC SP:82-2008 & IRC SP:13-2004
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-16 h-16 border-t-2 border-l-2 border-[rgb(245,180,0)]/30" />
      <div className="absolute top-20 right-20 w-16 h-16 border-t-2 border-r-2 border-[rgb(245,180,0)]/30" />
      <div className="absolute bottom-20 left-20 w-16 h-16 border-b-2 border-l-2 border-[rgb(245,180,0)]/30" />
      <div className="absolute bottom-20 right-20 w-16 h-16 border-b-2 border-r-2 border-[rgb(245,180,0)]/30" />
    </div>
  );
};
