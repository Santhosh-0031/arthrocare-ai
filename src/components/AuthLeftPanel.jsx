import React from "react";

/**
 * Reusable left panel for Login/Register pages.
 */
const AuthLeftPanel = ({ title = "Rheuma-Predict", subtitle }) => {
  return (
    <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-teal-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[var(--brand-green-light)] opacity-65" />
      <img
        alt="Abstract healthcare background"
        className="absolute h-full w-full object-cover mix-blend-multiply filter grayscale"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2sZimf2UQ2sbTwJ1xGSi-YF8zH0OoCZbt9BIDWYyEsUfv_72ZrcMyiOAFix4sYl9Z84HQpmfkmaNK89zbNCxNd_sqw7dBXnS2FQiDp2ABMoVKwNTXEyhwIyQYlx-iA6FpQOpeu4syy7bmCkHEzyNRSL2vI6vLJPtsxxWIVWdAaB4O0Hf7b7Ft1XqnIx1QLhB4Acgj-11NZmD_HP1bp177HuQ_ZGrhoDuatFu5u0NbjnF8YgJI1RG_Ydf-DQZg5wUczk05fTLTJfJm"
      />
      <div className="relative z-10 flex flex-col items-center text-center p-12 max-w-lg">
        <div className="inline-block p-4 bg-[var(--brand-teal)] rounded-full mb-6 shadow-md">
          {/* icon */}
          <svg className="w-12 h-12 text-white" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor" />
            <path clipRule="evenodd" fillRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236Z" fill="currentColor" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white drop-shadow-md">{title}</h1>
        {subtitle && <p className="mt-4 text-lg text-white opacity-90 drop-shadow-sm">{subtitle}</p>}
      </div>
    </div>
  );
};

export default AuthLeftPanel;
