import React from 'react'
import {
  Button,
  ButtonGroup,
  Typography
} from '@mui/material'

export enum ReportPages {
  Overall,
  Chart,
  Details
}

interface Types {
  activePage: ReportPages
  changeReportType: () => void
}

const ReportTypeSwitcher: React.FC<Types> = ({ activePage = ReportPages.Overall, changeReportType }) => {
  return (
    <div className="absolute flex justify-center w-full">
      <ButtonGroup
        disableElevation
        size="large"
        aria-label="outlined primary button group"
        sx={{ backgroundColor: "info.dark" }}
      >
        <Button
          variant="contained"
          className="w-40"
          sx={{ padding: 0, backgroundColor: "info.dark" }}
          onClick={() => changeReportType(ReportPages.Overall)}
        >
          <Typography
            variant="h5"
            sx={activePage === ReportPages.Overall ? {
              display: 'flex',
              justifyContent: 'center',
              color: "info.dark",
              backgroundColor: "white",
              border: 4,
              borderRadius: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
            } : {}}
          >
            Overall
          </Typography>
        </Button>
        <Button
          variant="contained"
          className="w-40"
          sx={{ padding: 0, backgroundColor: "info.dark" }}
          onClick={() => changeReportType(ReportPages.Chart)}
        >
          <Typography
            variant="h5"
            sx={activePage === ReportPages.Chart ? {
              display: 'flex',
              justifyContent: 'center',
              color: "info.dark",
              backgroundColor: "white",
              border: 4,
              borderRadius: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
            } : {}}
          >
            Chart
          </Typography>
        </Button>
        <Button
          variant="contained"
          className="w-40"
          sx={{ padding: 0, backgroundColor: "info.dark" }}
          onClick={() => changeReportType(ReportPages.Details)}
        >
          <Typography
            variant="h5"
            sx={activePage === ReportPages.Details ? {
              display: 'flex',
              justifyContent: 'center',
              color: "info.dark",
              backgroundColor: "white",
              border: 4,
              borderRadius: 2,
              width: '100%',
              height: '100%',
              alignItems: 'center',
            } : {}}
          >
            Details
          </Typography>
        </Button>
      </ButtonGroup>
    </div >
  )
}

export default ReportTypeSwitcher
