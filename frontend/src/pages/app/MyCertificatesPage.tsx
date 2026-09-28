import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { certificateService } from '@/lib/services';
import { useQuery } from '@/hooks/useApi';
import { CERTIFICATE_TYPE_LABELS } from '@/lib/constants';
import { downloadBlob, errorMessage, formatDate } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Skeleton,
} from '@/components/ui';
import type { CertificateType } from '@/types';

const TYPE_STYLES: Record<CertificateType, string> = {
  WINNER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  MERIT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  PARTICIPATION: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

export default function MyCertificatesPage() {
  const { data, loading, error, reload } = useQuery(() => certificateService.mine(), []);
  const [downloading, setDownloading] = useState<number | null>(null);

  async function handleDownload(id: number, title: string) {
    setDownloading(id);
    try {
      const blob = await certificateService.download(id);
      downloadBlob(blob, `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not download certificate.'));
    } finally {
      setDownloading(null);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="My certificates"
        description="Download your certificates or share a verification link."
      />

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={<Award className="h-6 w-6" />}
            title="No certificates yet"
            description="Certificates you earn from events will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.map((cert) => (
              <div key={cert.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between">
                  <span className="inline-flex rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                    <Award className="h-5 w-5" />
                  </span>
                  <Badge className={TYPE_STYLES[cert.type]}>
                    {CERTIFICATE_TYPE_LABELS[cert.type]}
                  </Badge>
                </div>
                <h3 className="mt-3 font-semibold text-slate-900 dark:text-slate-100">
                  {cert.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{cert.eventTitle}</p>
                <p className="mt-1 text-xs text-slate-400">
                  Issued {formatDate(cert.issuedAt)} · Code{' '}
                  <span className="font-mono">{cert.certificateCode}</span>
                </p>

                <div className="mt-4 flex gap-2 pt-2">
                  <Button
                    size="sm"
                    loading={downloading === cert.id}
                    onClick={() => handleDownload(cert.id, cert.title)}
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Link
                    to={`/verify-certificate/${cert.certificateCode}`}
                    className="btn-secondary text-sm"
                  >
                    <ShieldCheck className="h-4 w-4" /> Verify
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
