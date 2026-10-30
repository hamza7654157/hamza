
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks')
    return saved ? JSON.parse(saved) : []
  })

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [priority, setPriority] = useState('Moyenne')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Toutes')
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const getToday = () => {
    const today = new Date()
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0')
    ].join('-')
  }

  const isOverdue = (task) => {
    return task.endDate &&
      task.endDate < getToday() &&
      task.status !== 'Terminée'
  }

  const overdueTasks = tasks.filter(isOverdue)
  const completed = tasks.filter(t => t.status === 'Terminée').length
  const ongoing = tasks.filter(t => t.status === 'En cours' && !isOverdue(t)).length

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setPriority('Moyenne')
    setEditingId(null)
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!title.trim()) {
      setError('Veuillez saisir le titre de la tâche.')
      return
    }

    if (startDate && endDate && endDate < startDate) {
      setError('La date de fin doit être après la date de début.')
      return
    }

    const taskData = {
      id: editingId || Date.now(),
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      priority,
      status: editingId
        ? tasks.find(t => t.id === editingId).status
        : 'En cours'
    }

    if (editingId) {
      setTasks(tasks.map(t => t.id === editingId ? taskData : t))
    } else {
      setTasks([taskData, ...tasks])
    }

    resetForm()
  }

  const handleEdit = (task) => {
    setEditingId(task.id)
    setTitle(task.title)
    setDescription(task.description || '')
    setStartDate(task.startDate || '')
    setEndDate(task.endDate || '')
    setPriority(task.priority || 'Moyenne')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
      setTasks(tasks.filter(t => t.id !== id))
    }
  }

  const toggleStatus = (id) => {
    setTasks(tasks.map(t =>
      t.id === id
        ? {
            ...t,
            status: t.status === 'Terminée' ? 'En cours' : 'Terminée'
          }
        : t
    ))
  }

  const formatDate = (date) => {
    if (!date) return 'Non définie'
    return new Date(date + 'T00:00:00').toLocaleDateString('fr-FR')
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'Toutes' ||
      (filter === 'En retard' && isOverdue(task)) ||
      (filter === 'En cours' && task.status === 'En cours' && !isOverdue(task)) ||
      (filter === 'Terminée' && task.status === 'Terminée')

    return matchesSearch && matchesFilter
  })

  return (
    <div className="app">

      <header className="header">
        <div className="brand">
          <div className="logo">✓</div>
          <div>
            <h1>TaskFlow</h1>
            <p>Gestion intelligente des tâches</p>
          </div>
        </div>
        <div className="header-tag">Espace de travail</div>
      </header>

      <main className="container">

        <section className="welcome">
          <div>
            <span className="welcome-label">TABLEAU DE BORD</span>
            <h2>Organisez votre travail.</h2>
            <p>Planifiez vos tâches et suivez votre progression facilement.</p>
          </div>
          <div className="welcome-icon">✦</div>
        </section>

        <section className="stats">

          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <p>Total des tâches</p>
            <h3>{tasks.length}</h3>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>En cours</p>
            <h3>{ongoing}</h3>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Terminées</p>
            <h3>{completed}</h3>
          </div>

          <div className="stat-card">
            <div className="stat-icon red">!</div>
            <p>En retard</p>
            <h3>{overdueTasks.length}</h3>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">%</div>
            <p>Progression</p>
            <h3>{tasks.length ? Math.round(completed / tasks.length * 100) : 0}%</h3>
          </div>

        </section>

        <section className="card form-card">

          <div className="section-heading">
            <div>
              <span className="small-label">GESTION</span>
              <h2>{editingId ? 'Modifier la tâche' : 'Ajouter une nouvelle tâche'}</h2>
              <p>Remplissez les informations de votre tâche.</p>
            </div>
            <div className="heading-icon">＋</div>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="field full">
                <label>Titre de la tâche *</label>
                <input
                  type="text"
                  placeholder="Ex : Préparer le projet React..."
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="field full">
                <label>Description</label>
                <textarea
                  placeholder="Décrivez votre tâche..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="field">
                <label>Date de début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => {
                    setStartDate(e.target.value)
                    if (endDate && endDate < e.target.value) {
                      setEndDate('')
                    }
                  }}
                />
              </div>

              <div className="field">
                <label>Date de fin</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>

              <div className="field full">
                <label>Priorité</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  <option value="Basse">Basse</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Haute">Haute</option>
                </select>
              </div>

            </div>

            {error && <div className="error">{error}</div>}

            <div className="form-buttons">
              <button className="submit-btn" type="submit">
                {editingId ? 'Enregistrer les modifications' : '+ Ajouter la tâche'}
              </button>

              {editingId && (
                <button className="cancel-btn" type="button" onClick={resetForm}>
                  Annuler
                </button>
              )}
            </div>

          </form>
        </section>

        <section className="card tasks-card">

          <div className="tasks-header">
            <div>
              <span className="small-label">VOTRE ACTIVITÉ</span>
              <h2>Liste des tâches</h2>
            </div>
            <span className="task-count">{filteredTasks.length} tâches</span>
          </div>

          <div className="toolbar">

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Rechercher une tâche..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="Toutes">Toutes les tâches</option>
              <option value="En cours">En cours</option>
              <option value="Terminée">Terminées</option>
              <option value="En retard">En retard</option>
            </select>

          </div>

          {filteredTasks.length === 0 ? (

            <div className="empty">
              <div>▤</div>
              <h3>Aucune tâche trouvée</h3>
              <p>Ajoutez une nouvelle tâche ou modifiez votre recherche.</p>
            </div>

          ) : (

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>TÂCHE</th>
                    <th>DATES</th>
                    <th>PRIORITÉ</th>
                    <th>STATUT</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTasks.map(task => (

                    <tr key={task.id}>

                      <td>
                        <div className="task-name">{task.title}</div>
                        <div className="task-description">
                          {task.description || 'Aucune description'}
                        </div>
                      </td>

                      <td>
                        <div className="date-info">
                          <span>Début : {formatDate(task.startDate)}</span>
                          <span>Fin : {formatDate(task.endDate)}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`priority ${(task.priority || 'Moyenne').toLowerCase()}`}>
                          {task.priority || 'Moyenne'}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`status ${
                            task.status === 'Terminée'
                              ? 'done'
                              : isOverdue(task)
                              ? 'overdue'
                              : 'progress'
                          }`}
                          onClick={() => toggleStatus(task.id)}
                        >
                          {isOverdue(task) ? 'En retard' : task.status}
                        </button>
                      </td>

                      <td>
                        <div className="actions">
                          <button
                            className="edit-btn"
                            title="Modifier"
                            onClick={() => handleEdit(task)}
                          >
                            ✎
                          </button>

                          <button
                            className="delete-btn"
                            title="Supprimer"
                            onClick={() => handleDelete(task.id)}
                          >
                            ×
                          </button>
                        </div>
                      </td>

                    </tr>

                  ))}
                </tbody>
              </table>
            </div>

          )}

        </section>

        <footer>
          TaskFlow © 2026 — Gestion simple et efficace
        </footer>

      </main>
    </div>
  )
}

export default App


