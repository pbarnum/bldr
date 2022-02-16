import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Select, { SingleValue } from 'react-select';
import { AppContext } from '../App';

interface LimitOption {
  label: string;
  value: number;
}

const selectOptions = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '25', value: 25 },
];

const TableFilters = (): React.ReactElement => {
  const ctx: AppContext = useOutletContext();

  const selectChange = (selected: SingleValue<LimitOption>) => {
    if (!selected) {
      return;
    }
    let p = ctx.uri.page || 1;
    if (selected.value > (ctx.uri.limit || 5)) {
      p = 1;
    }

    ctx.uri.setPage(p).setLimit(selected.value).save();
  };

  const archiveToggle = () => {
    ctx.uri.setArchived(ctx.uri.archived === null || ctx.uri.archived === false).save();
  };

  return (
    <div className="row">
      <div className="col">
        <Select
          value={selectOptions.find((o) => o.value === ctx.uri.limit) || selectOptions[0]}
          onChange={selectChange}
          options={selectOptions}
          className="bldr-limit-select"
        />
      </div>
      <div className="col">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="archived"
            checked={ctx.uri.archived === true}
            onChange={archiveToggle}
          />
          <label className="form-check-label" htmlFor="archived">
            Archived
          </label>
        </div>
      </div>
    </div>
  );
};

export default TableFilters;
