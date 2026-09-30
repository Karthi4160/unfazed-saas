import React from 'react';
import Sidebar from './Sidebar';

const PageLayout = ({ children, title, subtitle, actions }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="lg:pl-64 pt-14 lg:pt-0">
        <main className="max-w-7xl mx-auto p-6 lg:p-8">
          {(title || actions) && (
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                {title && <h1 className="page-title">{title}</h1>}
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;