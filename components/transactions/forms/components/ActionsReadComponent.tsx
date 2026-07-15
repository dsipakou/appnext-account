import { GridRenderCellParams, GridRowId, GridRowModes, GridRowModesModel } from '@mui/x-data-grid';
import { Check, CheckCheck, Minus, Pencil, Split, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';

interface Types extends GridRenderCellParams {
  rowModesModel: GridRowModesModel;
  handleDeleteClick: (params: GridRenderCellParams) => void;
  handleApplyChanges: (id: GridRowId) => void;
  handleEditClick: (id: GridRowId) => void;
  handleDuplicateClick: (params: GridRenderCellParams) => void;
}

const ActionsReadComponent: React.FC<Types> = (params) => {
  const [prevState, setPrevState] = React.useState(null);
  const isInEditMode = params.rowModesModel[params.id]?.mode === GridRowModes.Edit;

  React.useEffect(() => {
    setPrevState(params.row);
  }, []);

  const checkAndApply = (rowId: GridRowId) => {
    params.handleApplyChanges(rowId)();

    const isChanged = Object.keys(prevState).every((key) => prevState[key] === params.row[key]);
    if (isChanged) {
      params.row.saved = false;
    }
  };

  if (isInEditMode) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-0 bg-slate-100 px-0">
        {!params.row.saved && (
          <>
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-green-500 text-green-500"
              onClick={params.handleApplyChanges(params.id)}
            >
              <Check className="h-4" />
            </div>
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-red-500 text-red-500"
              onClick={() => params.handleDeleteClick(params)}
            >
              <Minus />
            </div>
          </>
        )}
        {params.row.saved && (
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-green-500 text-green-500"
            onClick={() => checkAndApply(params.id)}
          >
            <Check className="h-4" />
          </div>
        )}
      </div>
    );
  } else if (params.value) {
    return (
      <div className="gap-p flex h-full w-full items-center justify-center bg-slate-100 px-0">
        <div className="text-gray-700">
          <Pencil className="h-4 w-4 cursor-pointer" onClick={params.handleEditClick(params.id)} />
        </div>
        <div className="">
          <CheckCheck className="text-green-500" />
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex w-full items-center justify-center gap-0">
        <Button
          size="xs"
          className="border-2 border-blue-400 bg-blue-400 text-white"
          onClick={() => params.handleDuplicateClick(params)}
        >
          <Split className="h-4" />
        </Button>
        <Button size="xs" variant="destructive" onClick={() => params.handleDeleteClick(params)}>
          <Trash2 className="h-4" />
        </Button>
      </div>
    );
  }
};

export default ActionsReadComponent;
