// Industry-specific company descriptions
const industryDescriptions: Record<string, string> = {
  'Automotive': 'an automotive company helping customers find their perfect vehicle',
  'Real Estate': 'a real estate company helping clients find their dream properties',
  'Healthcare': 'a healthcare provider dedicated to patient care and wellness',
  'Technology/SaaS': 'a technology company providing innovative software solutions',
  'Insurance': 'an insurance company protecting what matters most to our clients',
  'Finance': 'a financial services company helping clients achieve their financial goals',
  'Retail': 'a retail company providing quality products and exceptional service',
  'Education': 'an education platform empowering learners to reach their potential',
  'Other': 'a company dedicated to serving our customers'
}

// Use case specific role descriptions
const useCaseRoles: Record<string, string> = {
  'Lead Qualification': 'warm, patient, and professional lead qualification specialist',
  'Customer Support': 'helpful and knowledgeable customer support representative',
  'Sales': 'friendly and consultative sales representative',
  'Appointment Scheduling': 'efficient and courteous scheduling coordinator',
  'Survey': 'engaging survey coordinator',
  'General': 'professional representative'
}

export function generateRoleSection(
  agentName: string,
  useCase: string,
  companyName: string,
  industry: string
): string {
  // Get the appropriate descriptions
  const roleDescription = useCaseRoles[useCase] || useCaseRoles['General']
  const industryDescription = industryDescriptions[industry] || industryDescriptions['Other']
  
  // Generate the role section
  return `Your name is ${agentName}. You're a ${roleDescription} at ${companyName} — ${industryDescription}.`
}

// Language mapping for voice selection
export const voiceLanguageMap: Record<string, string> = {
  // Add voice IDs and their corresponding languages here
  // This will be populated based on actual voice data
  'default': 'English'
}

export function getLanguageFromVoice(voiceId: string, voices: any[]): string {
  const voice = voices.find(v => v.id === voiceId)
  if (!voice) return 'English'
  
  // Check if voice name contains language hints
  const voiceName = voice.name.toLowerCase()
  if (voiceName.includes('hindi') || voiceName.includes('hinglish') || voiceName === 'english indian woman') {
    return 'Hinglish'
  }
  if (voiceName.includes('spanish')) {
    return 'Spanish'
  }
  if (voiceName.includes('french')) {
    return 'French'
  }
  
  return 'English'
}

export function generateLanguageLine(language: string): string {
  return `Your speaking language is ${language}.`
}

// Generate enhanced language instructions for backend (hidden from user)
export function generateHiddenLanguageInstructions(voiceId: string, voices: any[]): string {
  const voice = voices.find(v => v.id === voiceId)
  if (!voice) return ''
  
  const voiceName = voice.name
  const language = getLanguageFromVoice(voiceId, voices)
  
  // Only add instructions for Hindi/Hinglish voices
  if (language !== 'Hinglish') return ''
  
  let instructions = `

IMPORTANT LANGUAGE INSTRUCTION:
You are capable of speaking both English and Hinglish. Adapt your language based on how the user communicates:
- If the user speaks primarily in English, respond in clear English
- If the user speaks in Hindi or Hinglish, respond in natural Hinglish
- Match the user's language preference and comfort level
- You can start with your natural Hinglish style, but switch to English if the user clearly prefers English

HINGLISH STYLE GUIDE (when using Hinglish):
Use Hinglish – a natural, conversational mix of Hindi and English. Feel free to code-switch within a sentence (e.g., "Appointment 3 baje pe rakha hai" , "Kya main aapko 3 baje call kar sakta hoon for a quick follow-up?" ). Mirror the user's ratio of Hindi↔English where possible.

GRAMMAR PRECISION:
Hindi nouns have inherent gender that MUST be respected:
- Masculine terms (use करना/होना/था): appointment, order, payment, plan
- Feminine terms (use करनी/होनी/थी): meeting, booking, call, delivery, query
- For time expressions: Use "pe" for "at" (e.g., "6:45 pe appointment", "3 baje pe meeting")
- For currency: Say "₹1000" as "ek hazaar rupees", "₹500" as "paanch sau rupees",
- NEVER say "appointment karni hai" (appointment is masculine)
- NEVER say "meeting karna hai" (meeting is feminine)
- NEVER say "six forty-five baje hai appointment" - instead say "six forty-five pe hoga appointment"
- NEVER say "R.S." or "rupiya" - always say "rupees"`

  // Add voice-specific personality without duplicating language instructions
  if (voiceName === 'Hindi Man') {
    instructions += `

VOICE PERSONALITY: Speak with a male personality. Use masculine tone, style, and pronouns.
When speaking in Hinglish, follow correct grammatical gender rules. When speaking in English, use standard English grammar. Do not change the gender of objects or nouns based on your persona.
Only use the customer name, agent name, or any other names explicitly provided in the context. Do not make up or assume any names.`
  } else if (voiceName === 'Hindi Woman' || voiceName === 'English Indian Woman') {
    instructions += `

VOICE PERSONALITY: Speak with a female personality. Use feminine tone, style, and pronouns.
When speaking in Hinglish, follow correct grammatical gender rules. When speaking in English, use standard English grammar. Do not change the gender of objects or nouns based on your persona.
Only use the customer name, agent name, or any other names explicitly provided in the context. Do not make up or assume any names.
`
  }
  
  return instructions
}

// Extract variables from prompt (moved from legacy)
export function extractVariablesFromPrompt(prompt: string): string[] {
  const variablePattern = /\{\{([^}]+)\}\}/g
  const variables: string[] = []
  let match
  
  while ((match = variablePattern.exec(prompt)) !== null) {
    const variable = match[1].trim()
    if (!variables.includes(variable)) {
      variables.push(variable)
    }
  }
  
  return variables
}