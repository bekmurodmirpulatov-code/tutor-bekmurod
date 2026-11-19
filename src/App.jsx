import { useState } from 'react'
import { BookOpen, Check, Flame, Footprints, GraduationCap, Headphones, LogOut, Mic, Play, Trophy, Users } from 'lucide-react'

const achievements = [
  ['First Step', 'Complete Day 1', Footprints],
  ['Getting into the Rhythm', 'Complete 3 days in a row', 'music'],
  ['One Week Strong', 'Complete the first 7 days', 'muscle'],
  ['Halfway There', 'Complete 12 days', 'box'],
  ['Almost There', 'Complete 20 days', Trophy],
  ['24-Day Finisher', 'Complete all 24 days', Trophy],
]

const activities = [
  ['Words & grammar', BookOpen, true],
  ['Podcast', Headphones, true],
  ['Article', BookOpen, true],
  ['Watching', Play, true],
  ['Speaking', Mic, false],
  ['Film & cartoon', Play, false],
  ['Reflection', Check, false],
]

export default function App() {
  const [role, setRole] = useState('student')
  const [selectedDay, setSelectedDay] = useState(1)

  const isTeacher = role === 'teacher'

  return (
    <div className="app-shell">
      <header>
        <nav className="nav">
          <button className="nav-main">General English</button>
          <button>Reading</button>
          <button>Speaking</button>
          <button>IELTS <span className="soon">SOON</span></button>
          <button>CEFR <span className="soon">SOON</span></button>
          <button>My words <span className="count">262</span></button>
          <button>Progress</button>
          <button>Ranking</button>
          <button>Level B2</button>
          <button className="display">A<span>A</span> Display</button>
        </nav>
        <button className="logout"><LogOut size={15} /> Log out</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">{isTeacher ? 'TEACHER DASHBOARD' : 'HI BEKMuroD • TODAY\'S HOMEWORK'}</p>
            <div className="day-line"><h1>{isTeacher ? 'Homework' : 'Day 01'}</h1>{!isTeacher && <strong>of 24</strong>}</div>
            <p className="motivation">{isTeacher ? 'Assign work, review submissions, and monitor student progress.' : 'You don\'t have to be great to start, but you have to start to become great.'}</p>
            <div className="activity-row">
              {activities.map(([label, Icon, done]) => (
                <button className="activity-pill" key={label}>
                  <span className={done ? 'icon complete' : 'icon'}><Icon size={15} /></span>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {isTeacher ? (
            <div className="teacher-stats">
              <div><Users /><strong>24</strong><span>Students</span></div>
              <div><GraduationCap /><strong>18</strong><span>Submitted</span></div>
              <div><Trophy /><strong>75%</strong><span>Completion</span></div>
            </div>
          ) : (
            <div className="progress-card">
              <div className="ring"><span>4</span><small>of 24 days</small></div>
              <div className="streak"><Flame size={15} /> 1-day streak</div>
            </div>
          )}
        </section>

        {isTeacher ? (
          <section className="panel">
            <div className="panel-heading"><h2>Student progress</h2><button className="new-task">+ New homework</button></div>
            <div className="student-table">
              {['Bekmurod M.', 'Alice Smith', 'Daniel Kim', 'Maria Lopez'].map((name, i) => (
                <div className="student-row" key={name}><div className="avatar">{name[0]}</div><strong>{name}</strong><div className="student-bar"><span style={{width: `${[92,74,58,81][i]}%`}} /></div><b>{[92,74,58,81][i]}%</b><button>View</button></div>
              ))}
            </div>
          </section>
        ) : (
          <section className="panel">
            <div className="panel-heading"><h2>Achievements</h2><span>0 of 6 unlocked</span></div>
            <div className="achievement-grid">
              {achievements.map(([title, text, Icon]) => (
                <article className="achievement" key={title}><div className="achievement-icon">{typeof Icon === 'string' ? '◆' : <Icon />}</div><div><h3>{title}</h3><p>{text}</p></div></article>
              ))}
            </div>
          </section>
        )}

        <div className="role-switch" aria-label="Preview role">
          <button className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>Student</button>
          <button className={role === 'teacher' ? 'active' : ''} onClick={() => setRole('teacher')}>Teacher</button>
        </div>
      </main>
    </div>
  )
}
