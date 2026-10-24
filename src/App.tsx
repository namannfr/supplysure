import { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { ToastProvider } from './components/ui/Toast';
import { useRoute } from './lib/router';
import { DemoProvider } from './lib/store';
import { AuditPacks } from './pages/AuditPacks';
import { Dashboard } from './pages/Dashboard';
import { PackageDetail, Packages } from './pages/Packages';
import { ReadinessCheck } from './pages/ReadinessCheck';
import { RequirementLibrary } from './pages/RequirementLibrary';
import { ReviewQueue } from './pages/ReviewQueue';
import { Suppliers } from './pages/Suppliers';

function Routes() {
  const route = useRoute();
  const [section, id] = route.segments;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route.path]);

  let page;
  switch (section) {
    case 'packages':
      page = id ? <PackageDetail id={id} /> : <Packages route={route} />;
      break;
    case 'suppliers':
      page = <Suppliers route={route} />;
      break;
    case 'readiness':
      page = <ReadinessCheck route={route} />;
      break;
    case 'library':
      page = <RequirementLibrary route={route} />;
      break;
    case 'review':
      page = <ReviewQueue />;
      break;
    case 'audit':
      page = <AuditPacks route={route} />;
      break;
    default:
      page = <Dashboard />;
  }

  return <AppShell current={`/${section ?? 'dashboard'}`}>{page}</AppShell>;
}

export function App() {
  return (
    <DemoProvider>
      <ToastProvider>
        <Routes />
      </ToastProvider>
    </DemoProvider>
  );
}
