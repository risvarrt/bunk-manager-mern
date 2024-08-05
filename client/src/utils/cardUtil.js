import Grid from '@material-ui/core/Grid';
import SubjectCard from '../components/UI/Cards/SubjectCard';
const date = new Date();
const NumtoDay = {
    0: 'Sunday',
    1: 'Monday', 
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
}

//subject.days.includes(NumtoDay[date.getDay()]) to check if days includes the current day

export const classCard = (props) => props.subjects.map(subject => {
  if (subject.subjectType === 'regular' && subject.days.includes(NumtoDay[date.getDay()])) {
    return (
      <Grid item xs={12} sm={4} md={3} key={subject.id}>
        <SubjectCard data={subject}/>
      </Grid>
    )
  } else return null;
});

export const labCard = (props) => props.subjects.map(subject => {
  if (subject.subjectType === 'lab' && subject.days.includes(NumtoDay[date.getDay()])) {
    return (
      <Grid item xs={12} sm={4} md={3} key={subject.id}>
        <SubjectCard data={subject}/>
      </Grid>
    )
  } else return null;
});
