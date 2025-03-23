import "./app.css";
import { gql, useQuery, useMutation } from "@apollo/client";
import { Assignment, Course } from "./types.ts";

export function App() {
  const { loading, error, data } = useQuery(gql`
      query GetCourses {
        courses {
          name
          id
          assignments {
            name
            grade
            weight
            id
          }
        }
      }
    `);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const [updateAssignment, _] = useMutation(gql``);

  return (
    <div className="App">
      <h1>GradeWarrior</h1>
      {data.courses.map((course: Course) => (
        <div key={course.id}>
          <h2>{course.name}</h2>
          <ul>
            {course.assignments.map((assignment: Assignment) => (
              <li key={assignment.id}>
                {assignment.name} - {assignment.grade} ({assignment.weight})
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
