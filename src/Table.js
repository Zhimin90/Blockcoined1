import React from 'react';
import { Table } from 'semantic-ui-react';

const TablePagination = ({ challengers }) => {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Player</Table.HeaderCell>
          <Table.HeaderCell>Score</Table.HeaderCell>
          <Table.HeaderCell>Ticket</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {Object.keys(challengers).map((key, index) => (
          <Table.Row key={key + index}>
            <Table.Cell>{challengers[key].challengers}</Table.Cell>
            <Table.Cell>{challengers[key].score}</Table.Cell>
            <Table.Cell>{challengers[key].num_ticket}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default TablePagination;
