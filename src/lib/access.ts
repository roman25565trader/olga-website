import type { Access, FieldAccess } from 'payload'

export const anyone: Access = () => true
export const loggedIn: Access = ({ req }) => Boolean(req.user)
export const loggedInField: FieldAccess = ({ req }) => Boolean(req.user)
/** Посетитель видит только то, что включено для показа. */
export const publishedOrLoggedIn: Access = ({ req }) => (req.user ? true : { active: { equals: true } })
