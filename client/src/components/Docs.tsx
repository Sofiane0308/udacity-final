import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createDoc, deleteDoc, getDocs, patchDoc } from '../api/docs-api'
import Auth from '../auth/Auth'
import { Doc } from '../types/Doc'

interface DocsProps {
  auth: Auth
  history: History
}

interface DocsState {
  docs: Doc[]
  newDocName: string
  loadingDocs: boolean
}

export class Docs extends React.PureComponent<DocsProps, DocsState> {
  state: DocsState = {
    docs: [],
    newDocName: '',
    loadingDocs: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newDocName: event.target.value })
  }

  onEditButtonClick = (docId: string) => {
    this.props.history.push(`/docs/${docId}/edit`)
  }

  onDocCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newDoc = await createDoc(this.props.auth.getIdToken(), {
        name: this.state.newDocName,
        dueDate
      })
      this.setState({
        docs: [...this.state.docs, newDoc],
        newDocName: ''
      })
    } catch {
      alert('Doc creation failed')
    }
  }

  onDocDelete = async (docId: string) => {
    try {
      await deleteDoc(this.props.auth.getIdToken(), docId)
      this.setState({
        docs: this.state.docs.filter(doc => doc.docId != docId)
      })
    } catch {
      alert('Doc deletion failed')
    }
  }

  onDocCheck = async (pos: number) => {
    try {
      const doc = this.state.docs[pos]
      await patchDoc(this.props.auth.getIdToken(), doc.docId, {
        name: doc.name,
        dueDate: doc.dueDate,
        done: !doc.done
      })
      this.setState({
        docs: update(this.state.docs, {
          [pos]: { done: { $set: !doc.done } }
        })
      })
    } catch {
      alert('Doc deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const docs = await getDocs(this.props.auth.getIdToken())
      this.setState({
        docs,
        loadingDocs: false
      })
    } catch (e) {
      alert(`Failed to fetch docs: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateDocInput()}

        {this.renderDocs()}
      </div>
    )
  }

  renderCreateDocInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New Document',
              onClick: this.onDocCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Passport..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderDocs() {
    if (this.state.loadingDocs) {
      return this.renderLoading()
    }

    return this.renderDocsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderDocsList() {
    return (
      <Grid padded>
        {this.state.docs.map((doc, pos) => {
          return (
            <Grid.Row key={doc.docId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onDocCheck(pos)}
                  checked={doc.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {doc.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {doc.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(doc.docId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onDocDelete(doc.docId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {doc.attachmentUrl && (
                <Image src={doc.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
