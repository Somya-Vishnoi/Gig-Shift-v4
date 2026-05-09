// Stub — emailjs not used in v4 flow
// Legacy files import this; keeping it to avoid build errors

export async function sendWelcomeEmail(_data: {
  to: string
  name: string
  role: string
}): Promise<void> {
  // noop in v4
  return Promise.resolve()
}
