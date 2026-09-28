import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Check,
  Download,
  Link2,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import { certificateService } from '@/lib/services';
import { CERTIFICATE_TYPE_LABELS } from '@/lib/constants';
import { downloadBlob, errorMessage, formatDate } from '@/lib/utils';
import { PageContainer } from '@/components/layout/RootLayout';
import { Button, Field, PageHeader, Spinner, TextInput } from '@/components/ui';
import type { CertificateVerificationResponse } from '@/types';

export default function VerifyCertificatePage() {
  const { code: codeParam } = useParams();
  const [code, setCode] = useState(codeParam ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateVerificationResponse | null>(null);
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Action state for the buttons on a valid result.
  const [downloading, setDownloading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Inline visual preview of the rendered certificate (the actual PDF with its
  // background, text and QR) so a valid result shows the certificate itself,
  // not just its metadata.
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  async function verify(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setVerifiedCode(null);
    setActionError(null);
    setCopied(false);
    try {
      const res = await certificateService.verify(trimmed);
      setResult(res);
      setVerifiedCode(trimmed);
    } catch (err) {
      setError(errorMessage(err, 'Could not verify this certificate.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!verifiedCode) return;
    setDownloading(true);
    setActionError(null);
    try {
      const blob = await certificateService.verifyDownload(verifiedCode);
      downloadBlob(blob, `certificate-${verifiedCode}.pdf`);
    } catch (err) {
      setActionError(errorMessage(err, 'Could not download this certificate.'));
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyLink() {
    if (!verifiedCode) return;
    const link = `${window.location.origin}/verify-certificate/${verifiedCode}`;
    setActionError(null);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setActionError('Copy failed — you can copy the link from the address bar instead.');
    }
  }

  // Once a certificate verifies as valid, fetch its rendered PDF and show it
  // inline so the visitor sees the actual certificate (background, text and QR),
  // not just its metadata. The object URL is revoked on cleanup to avoid leaks.
  useEffect(() => {
    if (!result?.valid || !verifiedCode) {
      setPreviewUrl(null);
      setPreviewError(null);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    certificateService
      .verifyDownload(verifiedCode)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
        setPreviewUrl(objectUrl);
      })
      .catch((err) => {
        if (!cancelled) {
          setPreviewError(errorMessage(err, 'Could not load the certificate preview.'));
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [result?.valid, verifiedCode]);

  // Auto-verify when a code is present in the URL.
  useEffect(() => {
    if (codeParam) void verify(codeParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeParam]);

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <PageHeader
          title="Verify a certificate"
          description="Enter a certificate code to confirm it was issued by CampusConnect."
        />

        <form
          className="mt-6 flex items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void verify(code);
          }}
        >
          <Field label="Certificate code" htmlFor="code" className="flex-1">
            <TextInput
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CC-1A2B3C4D"
              autoFocus
            />
          </Field>
          <Button type="submit" loading={loading}>
            Verify
          </Button>
        </form>

        <div className="mt-8">
          {loading && (
            <div className="flex justify-center py-10">
              <Spinner className="h-6 w-6 text-brand-600" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {result && !loading && (
            <>
              {result.valid && (
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-3 bg-green-50 px-5 py-4 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <ShieldCheck className="h-6 w-6 shrink-0" />
                    <div>
                      <p className="font-semibold">Valid certificate</p>
                      <p className="text-xs opacity-80">Issued by CampusConnect</p>
                    </div>
                  </div>

                  {/* The certificate itself, rendered inline so a valid result shows
                      the actual document (background, text and QR), not just its details. */}
                  <div className="border-b border-slate-100 bg-slate-100/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    {previewLoading ? (
                      <div className="flex h-[440px] items-center justify-center">
                        <Spinner className="h-6 w-6 text-brand-600" />
                      </div>
                    ) : previewUrl ? (
                      <iframe
                        src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`}
                        title={`Certificate for ${result.recipientName ?? 'recipient'}`}
                        className="h-[440px] w-full rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700"
                      />
                    ) : (
                      <div className="flex min-h-[96px] items-center justify-center px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        {previewError ?? 'Preview unavailable — use the “Download certificate” button below to view it.'}
                      </div>
                    )}
                  </div>

                  <dl className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
                    <Row label="Recipient" value={result.recipientName} />
                    <Row label="Event" value={result.eventTitle} />
                    <Row
                      label="Type"
                      value={result.type ? CERTIFICATE_TYPE_LABELS[result.type] : undefined}
                    />
                    <Row label="Title" value={result.title} />
                    <Row label="Issued on" value={formatDate(result.issuedAt)} />
                    <Row label="Code" value={verifiedCode ?? undefined} />
                  </dl>
                  <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row">
                    <Button
                      variant="primary"
                      onClick={handleDownload}
                      loading={downloading}
                      className="sm:flex-1"
                    >
                      <Download className="h-4 w-4" />
                      Download certificate
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={handleCopyLink}
                      className="sm:flex-1"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Link copied
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4" />
                          Copy verify link
                        </>
                      )}
                    </Button>
                  </div>
                  {actionError && (
                    <p className="border-t border-slate-100 px-5 py-3 text-sm text-red-600 dark:border-slate-800 dark:text-red-400">
                      {actionError}
                    </p>
                  )}
                </div>
              )}

              {!result.valid && result.revoked && (
                <div className="card overflow-hidden">
                  <div className="flex items-center gap-3 bg-amber-50 px-5 py-4 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <ShieldX className="h-6 w-6 shrink-0" />
                    <div>
                      <p className="font-semibold">Certificate revoked</p>
                      <p className="text-xs opacity-80">
                        This certificate was issued by CampusConnect but has since been revoked and
                        is no longer valid.
                      </p>
                    </div>
                  </div>
                  <dl className="divide-y divide-slate-100 px-5 dark:divide-slate-800">
                    <Row label="Recipient" value={result.recipientName} />
                    <Row label="Event" value={result.eventTitle} />
                    <Row
                      label="Type"
                      value={result.type ? CERTIFICATE_TYPE_LABELS[result.type] : undefined}
                    />
                    <Row label="Title" value={result.title} />
                    <Row label="Issued on" value={formatDate(result.issuedAt)} />
                    <Row label="Revoked on" value={formatDate(result.revokedAt)} />
                  </dl>
                </div>
              )}

              {!result.valid && !result.revoked && (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-5 text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-300">
                  <SearchX className="h-6 w-6 shrink-0" />
                  <p className="text-sm font-medium">
                    No certificate matches this code. Please check the code and try again.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-sm text-slate-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-slate-900 dark:text-slate-100">
        {value}
      </dd>
    </div>
  );
}
