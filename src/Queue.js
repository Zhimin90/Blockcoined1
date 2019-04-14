import React from 'react'
import { List } from 'semantic-ui-react'


const QueueList = ({queue}) => (
  <List celled horizontal>
    {Object.keys(queue).map( (key, index) => <List.Item key={key}>{queue[key].challengers}</List.Item> )}
  </List>
)

export default QueueList
