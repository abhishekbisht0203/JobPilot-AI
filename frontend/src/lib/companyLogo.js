const companyLogos = {
  amazon: '/logos/amazon.svg',
  meta: '/logos/meta.svg',
  uber: '/logos/uber.svg',
  phonepe: '/logos/phonepe.svg',
  razorpay: '/logos/razorpay.svg',
  zomato: '/logos/zomato.svg',
  google: '/logos/google.svg',
  microsoft: '/logos/microsoft.svg',
  adobe: '/logos/adobe.svg',
  netflix: '/logos/netflix.svg',
  paytm: '/logos/paytm.svg',
  flipkart: '/logos/flipkart.svg',
  swiggy: '/logos/swiggy.svg',
  infosys: '/logos/infosys.svg',
  tcs: '/logos/tcs.svg',
  accenture: '/logos/accenture.svg',
  ibm: '/logos/ibm.svg',
  deloitte: '/logos/deloitte.svg',
  oracle: '/logos/oracle.svg',
  salesforce: '/logos/salesforce.svg',
  apple: '/logos/apple.svg',
  nvidia: '/logos/nvidia.svg',
  intel: '/logos/intel.svg',
  linkedin: '/logos/linkedin.svg',
  spotify: '/logos/spotify.svg',
  airbnb: '/logos/airbnb.svg',
  atlassian: '/logos/atlassian.svg',
  walmart: '/logos/walmart.svg',
  wipro: '/logos/wipro.svg',
  capgemini: '/logos/capgemini.svg',
  cognizant: '/logos/cognizant.svg',
};

export function getCompanyLogo(companyName) {
  if (!companyName) return '';
  const key = companyName.toLowerCase().trim();
  return companyLogos[key] || '';
}
