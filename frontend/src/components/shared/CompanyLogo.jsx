import { useState } from 'react';
import { getCompanyLogo } from '@/lib/companyLogo';
import { cn } from '@/lib/utils';

export default function CompanyLogo({ companyName, logo, className }) {
  const [hasError, setHasError] = useState(false);
  const src = logo || getCompanyLogo(companyName);

  if (!src || hasError) {
    return (
      <div className={cn(
        "bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200 shrink-0 overflow-hidden",
        className
      )}>
        <img
          src="/logos/default-company.svg"
          alt={companyName || 'Company'}
          className="w-[55%] h-[55%] object-contain"
        />
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border border-gray-200 p-1 flex items-center justify-center overflow-hidden shrink-0",
      className
    )}>
      <img
        src={src}
        alt={companyName || 'Company'}
        className="w-full h-full object-contain"
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
}
