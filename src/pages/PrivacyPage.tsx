import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="container-narrow" style={{ padding: 'var(--sp-12) 0' }}>
      <Link to="/" className="text-sm" style={{ color: 'var(--forest-600)', marginBottom: 'var(--sp-4)', display: 'inline-block' }}>
        ← Back to home
      </Link>
      <h1 className="display-lg" style={{ marginBottom: 'var(--sp-6)' }}>Privacy and disclaimer</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
        <section>
          <h2 className="display-sm" style={{ marginBottom: 'var(--sp-3)', color: 'var(--ink-900)' }}>How MUVO stores your data</h2>
          <p>MUVO stores all project data — property details, inspection notes, photos and deduction records — locally in your browser using IndexedDB. Nothing is uploaded to a cloud server or external service.</p>
          <p style={{ marginTop: 'var(--sp-3)' }}>If you clear your browser data, use a different device, or lose your device, your data may be lost. You can export a backup JSON file from Settings to keep a copy.</p>
        </section>

        <section>
          <h2 className="display-sm" style={{ marginBottom: 'var(--sp-3)', color: 'var(--ink-900)' }}>What MUVO does not do</h2>
          <p>MUVO does not collect personal information, require an account, send data to third parties, or use analytics tracking. It does not access device GPS or upload photos to external services.</p>
        </section>

        <section>
          <h2 className="display-sm" style={{ marginBottom: 'var(--sp-3)', color: 'var(--ink-900)' }}>Disclaimer</h2>
          <p>MUVO is an independent evidence-organising tool. It is not a government service, deposit protection scheme, or law firm.</p>
          <ul style={{ marginTop: 'var(--sp-3)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <li>• MUVO helps you organise your own records. It does not provide legal advice.</li>
            <li>• MUVO cannot determine legal responsibility for damage automatically.</li>
            <li>• MUVO cannot guarantee the return of a deposit.</li>
            <li>• Deposit procedures may vary across England, Wales, Scotland and Northern Ireland.</li>
            <li>• Photo metadata (such as file dates) is shown for reference only and does not independently prove when or where an image was taken.</li>
          </ul>
        </section>

        <section>
          <h2 className="display-sm" style={{ marginBottom: 'var(--sp-3)', color: 'var(--ink-900)' }}>Deleting your data</h2>
          <p>You can delete your project and all associated evidence at any time from Settings. This permanently removes the data from your browser. This action cannot be undone.</p>
        </section>
      </div>
    </div>
  );
}
