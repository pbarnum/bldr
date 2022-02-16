import React from 'react';
import { Pagination as Rb } from 'react-bootstrap';
import { useLocation, useOutletContext } from 'react-router-dom';
import { AppContext } from '../App';
import { Pagination as PaginationObj } from '../types/api';

interface PaginationProps {
  pagination: PaginationObj;
}

const Pagination = (props: PaginationProps): React.ReactElement => {
  if (!props.pagination.total || props.pagination.total === 0) {
    return <></>;
  }

  const location = useLocation();
  const ctx: AppContext = useOutletContext();
  const totalPages = Math.ceil(props.pagination.total / (ctx.uri.limit || 5));
  const start = Math.max(1, props.pagination.current - 4);
  const end = Math.min(props.pagination.current + 4, totalPages);

  const pagItems = [];
  if (props.pagination.current > 1) {
    pagItems.push(<Rb.First href={location.pathname + ctx.uri.setPage(1).toString()} />);
    pagItems.push(<Rb.Prev href={location.pathname + ctx.uri.setPage(props.pagination.current - 1).toString()} />);
  }

  for (let i = start; i <= end; ++i) {
    const active = props.pagination.current === i;
    pagItems.push(
      <Rb.Item href={location.pathname + ctx.uri.setPage(i).toString()} active={active}>
        {i}
      </Rb.Item>
    );
  }

  if (props.pagination.current < totalPages) {
    pagItems.push(<Rb.Next href={location.pathname + ctx.uri.setPage(props.pagination.current + 1).toString()} />);
    pagItems.push(<Rb.Last href={location.pathname + ctx.uri.setPage(totalPages).toString()} />);
  }

  ctx.uri.reset();

  return (
    <nav>
      <Rb className="justify-content-center">{...pagItems}</Rb>
    </nav>
  );
};

export default Pagination;
