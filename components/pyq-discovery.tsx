import { ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react';

const sources = [
  {
    name: 'PYQJIIT',
    category: 'Community question-paper archive',
    description: 'Browse previous-year papers by academic year and branch on the external archive. Availability and paper details are maintained by its operators and contributors.',
    href: 'https://pyqjiit.rushilk.dev/',
    action: 'Browse question papers',
    trust: 'External community source',
  },
  {
    name: 'JIIT Web kiosk',
    category: 'University portal',
    description: 'Open the JIIT Web kiosk landing page for official student/parent portal access. JIIT Toppers does not collect your portal credentials.',
    href: 'https://webportal.jiit.ac.in/jiitwebkiosk/',
    action: 'Open Web kiosk',
    trust: 'University portal entry point',
  },
];

export function PyqDiscovery() {
  return <section className="jt-source-panel" aria-labelledby="jt-source-panel-title">
    <div className="jt-source-heading">
      <div><span className="jt-kicker">EXTERNAL ACADEMIC SOURCES</span><h2 id="jt-source-panel-title">Start with resources that already exist.</h2></div>
      <p>We link to the original source instead of copying papers without permission. Source availability and content can change outside this application.</p>
    </div>
    <div className="jt-grid jt-two">
      {sources.map(source => <article className="jt-resource" key={source.name}>
        <div className="jt-source-meta"><BookOpen size={19} aria-hidden="true"/><span>{source.category}</span></div>
        <h3>{source.name}</h3>
        <p>{source.description}</p>
        <div className="jt-source-footer"><span className="jt-pill"><ShieldCheck size={13} aria-hidden="true"/>{source.trust}</span>
          <a className="jt-primary jt-link-button" href={source.href} target="_blank" rel="noopener noreferrer">{source.action}<ArrowUpRight size={16} aria-hidden="true"/></a>
        </div>
      </article>)}
    </div>
    <p className="jt-source-note">JIIT Toppers is an independent student project. External links are provided for convenience and do not imply affiliation or endorsement.</p>
  </section>;
}
