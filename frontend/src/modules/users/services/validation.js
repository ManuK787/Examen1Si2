// Utilidades de validación para formulario de usuarios

export function validateEmail(email){
  if (!email) return 'Email es requerido'
  const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  if (!re.test(email)) return 'Formato de email inválido'
  return null
}

export function validateFullName(name){
  if (!name || !name.trim()) return 'Nombre completo es requerido'
  const trimmed = name.trim()
  if (trimmed.length < 3) return 'Nombre demasiado corto'
  // Permitir letras, espacios y acentos básicos, además de apóstrofe y guion.
  if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ' -]+$/.test(trimmed)) return 'Nombre no aceptado'
  // Evitar múltiples espacios consecutivos
  if (/\s{2,}/.test(trimmed)) return 'Evita dobles espacios'
  return null
}

export function validateUnit(unit){
  // Ajustado al nuevo dominio: Nro Casa / Terreno
  if (!unit || !unit.trim()) return 'Nro Casa / Terreno es requerido'
  const trimmed = unit.trim()
  // Regla: exactamente 3 dígitos y rango 100-999
  if (!/^\d{3}$/.test(trimmed)) return 'Debe tener exactamente 3 dígitos'
  const num = parseInt(trimmed, 10)
  if (num < 100) return 'Debe ser >= 100'
  return null
}

export function validatePhone(phone){
  if (!phone) return null // opcional
  const clean = phone.replace(/[^0-9]/g,'')
  if (clean.length === 0) return null
  if (clean.length !== 8) return 'Debe tener exactamente 8 dígitos'
  return null
}

export function validateCI(ci){
  if (!ci) return 'CI es requerido'
  // Reglas: solo dígitos, longitud entre 5 y 9
  if (!/^\d{5,9}$/.test(ci)) return 'CI debe tener entre 5 y 9 dígitos'
  return null
}

export function passwordScore(pwd){
  if (!pwd) return { score:0, label:'Vacía', variant:'empty' }
  let score = 0
  if (pwd.length >= 6) score++
  if (pwd.length >= 10) score++
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++
  if (/\d/.test(pwd)) score++
  if (/[@#%&!._-]/.test(pwd)) score++
  const labels = ['Muy débil','Débil','Media','Fuerte','Muy fuerte']
  return { score, label: labels[Math.min(score, labels.length-1)], variant: score >=4 ? 'strong' : score>=3? 'good' : 'weak' }
}
