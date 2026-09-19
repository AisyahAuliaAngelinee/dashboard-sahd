import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Flag, Users, UserRound } from 'lucide-react';
import { SiteFooter } from '../site-chrome';

export const metadata = {
  title: 'Pendulus X SAHD | X1 SAHD',
  description: 'Discover Pendulus X SAHD, our GTA Roleplay racing collaboration.',
};

const pitCrew = ['Jack Redfield', 'Anton Epson', 'Jaenab de Jongh', 'Oka Gray', 'Arynee Lee', 'Halfeti Terenzi', 'Benben Sudirman', 'August Gio', 'Asta Montgomery'];

const memberPhotos: Record<string,string> = {
 'Jack Redfield':'/racing/jack-hd.png',
 'Arynee Lee':'/racing/arynee-hd.png',
 'Oka Gray':'/racing/oka-hd.png',
 'August Gio':'/racing/august-hd.png',
 'Halfeti Terenzi':'/racing/halfeti-hd.png',
 'Leopold de Montegard':'/racing/leopold-hd.png',
 'Anton Epson':'/racing/anton-epson.webp',
 'Jaenab de Jongh':'/racing/jaenab-hd.png',
 'Asta Montgomery':'/racing/asta-hd.png',
 'Ivy Whitmore':'/racing/ivy-hd.png',
};
function MemberCard({name, role, photo, vacant = false}:{name:string;role:string;photo?:string;vacant?:boolean}) {
  return <article className={'racing-member'+(vacant?' vacant-seat':'')}>
    <div className="racing-member-photo">
      {photo ? <img src={photo} alt={'Portrait of '+name} loading="lazy"/> : <div className="racing-member-placeholder" role="img" aria-label={vacant?'Vacant driver position':'Portrait placeholder for '+name}><UserRound size={76} strokeWidth={.8}/><span>{vacant?'OPEN SEAT':'PHOTO COMING SOON'}</span></div>}
    </div>
    <div className="racing-member-copy"><div className="eyebrow">{role}</div><h3>{name}</h3></div>
  </article>;
}

export default function PendulusPage() {
  return <div className="racing-page">
    <header className="racing-header">
      <Link className="racing-wordmark" href="/pendulus-x-sahd">PENDULUS <span>X</span> SAHD<small>X1 SAHD · RACING TEAM</small></Link>
      <nav aria-label="Pendulus X SAHD navigation"><a href="#about-us">About Us</a><a href="#team">Team</a></nav>
      <Link className="racing-home" href="/"><ArrowLeft size={15}/> Medical Center</Link>
    </header>
    <main>
      <section className="racing-hero" aria-labelledby="racing-title">
        <div className="racing-hero-copy"><div className="eyebrow">ONE TEAM. SHARED AMBITION.</div><h1 id="racing-title">Driven by passion.<br/><em>United on the grid.</em></h1><p>Pendulus X SAHD — a new chapter beyond the hospital.</p></div>
        <div className="racing-art"><img src="/pendulus-racing.webp" alt="Pendulus X SAHD racing team logo and black, red, and white race car on a black background" fetchPriority="high"/></div>
        <div className="racing-hero-bottom"><span>PENDULUS X SAHD / X1 SAHD</span><a href="#about-us">Discover the team <ArrowUpRight size={17}/></a></div>
      </section>
      <section className="section racing-about" id="about-us">
        <div><div className="eyebrow">01 / ABOUT US</div><h2>A shared identity.<br/><em>A different kind of drive.</em></h2></div>
        <div className="racing-story"><p>Pendulus X SAHD brings our community together through a shared passion for racing in GTA Roleplay.</p><p>Under the X1 SAHD identity, the collaboration celebrates teamwork, focus, and the people behind every moment on the track.</p><div className="racing-values"><span><Flag size={18}/> Racing spirit</span><span><Users size={18}/> Teamwork</span></div></div>
      </section>
      <section className="section racing-team" id="team">
        <div className="section-heading"><div><div className="eyebrow">02 / TEAM</div><h2>The people.<br/><em>The driving force.</em></h2></div><p>Two identities. One team.</p></div>
        <figure className="racing-team-photo"><img src="/racing/team.webp" alt="Pendulus racing team gathered with their race car in the garage" loading="lazy"/><figcaption>Behind every lap, a team. <span>PENDULUS X SAHD</span></figcaption></figure>
        <h3 className="racing-group-title">Drivers &amp; Team Principal</h3>
        <div className="racing-lead-grid">
          <MemberCard name="Ivy Whitmore" role="Driver #1" photo={memberPhotos['Ivy Whitmore']}/>
          <MemberCard name="Vacant" role="Driver #2" vacant/>
          <MemberCard name="Leopold de Montegard" role="Team Principal" photo={memberPhotos['Leopold de Montegard']}/>
        </div>
        <h3 className="racing-group-title">Pit Crew <span>{String(pitCrew.length).padStart(2, '0')} MEMBERS</span></h3>
        <div className="racing-crew-grid">{pitCrew.map(name=><MemberCard key={name} name={name} role="Pit Crew" photo={memberPhotos[name]}/>)}</div>
      </section>
    </main>
    <SiteFooter/>
  </div>;
}
