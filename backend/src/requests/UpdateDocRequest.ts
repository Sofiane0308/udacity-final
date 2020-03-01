/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateDocRequest {
  name: string
  dueDate: string
  done: boolean
}