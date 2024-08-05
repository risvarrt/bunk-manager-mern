import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AttendanceBar from './AttendanceBar';
import CardMenu from './CardMenu';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { updateSubject } from '../../../actions/subjectActions';
import { useLocation } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  card: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    width: "100%",
    height: "250px",
  },
  imageDiv: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
  CardContent: {
    position: "relative",
    zIndex: 2,
    width: "100%",
  },
  upperCard: {
    width: "100%",
    position: "relative",
    flexGrow: 1,
    display: "flex",
  },
  lowerCard: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "0 15px",
  },
  bgImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  CardSubject: {
    ...theme.typography.CardSubject,
  },
  CardSemester: {
    ...theme.typography.CardSemester,
  },
  MoreVertIcon: {
    color: '#FFF',
    transform: 'scale(1.3)',
    marginLeft: '88%',
    marginTop: '-7rem',
    height: '35px',
    width: '35px'
  },
  button: {
    margin: theme.spacing(1),
  },
}));

const SubjectCard = (props) => {
  const classes = useStyles();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [clickedToday, setClickedToday] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const clickedStatus = localStorage.getItem(`clicked_${props.data.id}`);
    if (clickedStatus === today) {
      setClickedToday(true);
    } else {
      setClickedToday(false);
    }
  }, [props.data.id]);

  const handleBunkClass = () => {
    const today = new Date().toISOString().split('T')[0];
    const updatedData = {
      classesbunked: props.data.classesbunked + 1,
    };
    props.updateSubject(updatedData, props.data.id);
    localStorage.setItem(`clicked_${props.data.id}`, today);
    setClickedToday(true);
  };

  const {
    name,
    backgroundImage,
    semester,
    totalClasses,
    classesbunked,
    id,
  } = props.data;

  const renderSvg = () => {
    function toBase64(arr) {
      arr = new Uint8Array(arr);
      return btoa(
        arr.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
    }
    if (props.data) {
      const image = toBase64(backgroundImage.data);
      return (
        <React.Fragment>
          <img
            className={classes.bgImage}
            src={`data:image/svg+xml;base64,${image}`}
            alt="images"
          />
        </React.Fragment>
      );
    } else return null;
  };

  const renderEdit = () => {
    if (location.pathname === "/subject") {
      return (
        <React.Fragment>
          <CardMenu data={{ id: id }} />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {location.pathname === "/" && !clickedToday && (
            <Button
              variant="contained"
              color="secondary"
              className={classes.button}
              onClick={handleBunkClass}
            >
              Bunk Today Class
            </Button>
          )}
          <AttendanceBar
            data={{ bunked: classesbunked, totalClass: totalClasses, id: id }}
          />
        </React.Fragment>
      );
    }
  };

  return (
    <React.Fragment>
      <Card className={classes.card}>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Change Pic</MenuItem>
        </Menu>
        <div className={classes.upperCard}>
          <CardContent className={classes.CardContent}>
            <Typography className={classes.CardSubject} variant="h5">
              {name}
            </Typography>
            <Typography className={classes.CardSemester} variant="subtitle1">
              Semester {semester}
            </Typography>
            <IconButton className={classes.MoreVertIcon} onClick={handleClick}><MoreVertIcon /></IconButton>
          </CardContent>
          <div className={classes.imageDiv}>{renderSvg()}</div>
        </div>
        <div className={classes.lowerCard}>{renderEdit()}</div>
      </Card>
    </React.Fragment>
  );
};

export default connect(null, { updateSubject })(SubjectCard);
