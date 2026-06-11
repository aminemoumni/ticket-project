import api from './api'

const auth = (token) => ({ headers: { Authorization: `Bearer ${token}` } })

export const getTickets = (token) =>
    api.get('/tickets', auth(token))

export const getTicket = (token, id) =>
    api.get(`/tickets/${id}`, auth(token))

export const createTicket = (token, data) =>
    api.post('/tickets', data, auth(token))

export const updateTicket = (token, id, data) =>
    api.patch(`/tickets/${id}`, data, auth(token))

export const deleteTicket = (token, id) =>
    api.delete(`/tickets/${id}`, auth(token))

export const getComments = (token, ticketId) =>
    api.get(`/tickets/${ticketId}/comments`, auth(token))

export const createComment = (token, ticketId, content) =>
    api.post(`/tickets/${ticketId}/comments`, { content }, auth(token))
