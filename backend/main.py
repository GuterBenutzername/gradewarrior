from ariadne import QueryType, MutationType, gql, make_executable_schema
from ariadne.asgi import GraphQL
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import os

# Set up the database connection
engine = create_engine(os.environ['DATABASE_URL'])
Session = sessionmaker(bind=engine)
Base = declarative_base()

# Define the database models
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)
    courses = relationship('Course', back_populates='user')

class Course(Base):
    __tablename__ = 'courses'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    user = relationship('User', back_populates='courses')
    assignments = relationship('Assignment', back_populates='course')

class Assignment(Base):
    __tablename__ = 'assignments'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    grade = Column(Float)
    weight = Column(Float)
    t = Column(Boolean)
    course_id = Column(Integer, ForeignKey('courses.id'))
    course = relationship('Course', back_populates='assignments')

# Create the database tables
Base.metadata.create_all(engine)

# Define the query resolvers
query = QueryType()

@query.field('users')
def resolve_users(_, info):
    session = Session()
    users = session.query(User).all()
    session.close()
    return users

@query.field('user')
def resolve_user(_, info, id):
    session = Session()
    user = session.query(User).get(id)
    session.close()
    return user

@query.field('courses')
def resolve_courses(_, info):
    session = Session()
    courses = session.query(Course).all()
    session.close()
    return courses

@query.field('course')
def resolve_course(_, info, id):
    session = Session()
    course = session.query(Course).get(id)
    session.close()
    return course

@query.field('assignments')
def resolve_assignments(_, info):
    session = Session()
    assignments = session.query(Assignment).all()
    session.close()
    return assignments

@query.field('assignment')
def resolve_assignment(_, info, id):
    session = Session()
    assignment = session.query(Assignment).get(id)
    session.close()
    return assignment

# Define the mutation resolvers
mutation = MutationType()

@mutation.field('createUser')
def resolve_create_user(_, info, name, email):
    session = Session()
    user = User(name=name, email=email)
    session.add(user)
    session.commit()
    session.refresh(user)
    session.close()
    return user

@mutation.field('updateUser')
def resolve_update_user(_, info, id, name=None, email=None):
    session = Session()
    user = session.query(User).get(id)
    if name:
        user.name = name
    if email:
        user.email = email
    session.commit()
    session.refresh(user)
    session.close()
    return user

@mutation.field('deleteUser')
def resolve_delete_user(_, info, id):
    session = Session()
    user = session.query(User).get(id)
    session.delete(user)
    session.commit()
    session.close()
    return user

@mutation.field('createCourse')
def resolve_create_course(_, info, name, userId):
    session = Session()
    course = Course(name=name, user_id=userId)
    session.add(course)
    session.commit()
    session.refresh(course)
    session.close()
    return course

@mutation.field('updateCourse')
def resolve_update_course(_, info, id, name=None):
    session = Session()
    course = session.query(Course).get(id)
    if name:
        course.name = name
    session.commit()
    session.refresh(course)
    session.close()
    return course

@mutation.field('deleteCourse')
def resolve_delete_course(_, info, id):
    session = Session()
    course = session.query(Course).get(id)
    session.delete(course)
    session.commit()
    session.close()
    return course

@mutation.field('createAssignment')
def resolve_create_assignment(_, info, name, grade, weight, t, courseId):
    session = Session()
    assignment = Assignment(name=name, grade=grade, weight=weight, t=t, course_id=courseId)
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    session.close()
    return assignment

@mutation.field('updateAssignment')
def resolve_update_assignment(_, info, id, name=None, grade=None, weight=None, t=None):
    session = Session()
    assignment = session.query(Assignment).get(id)
    if name:
        assignment.name = name
    if grade is not None:
        assignment.grade = grade
    if weight is not None:
        assignment.weight = weight
    if t is not None:
        assignment.t = t
    session.commit()
    session.refresh(assignment)
    session.close()
    return assignment

@mutation.field('deleteAssignment')
def resolve_delete_assignment(_, info, id):
    session = Session()
    assignment = session.query(Assignment).get(id)
    session.delete(assignment)
    session.commit()
    session.close()
    return assignment

# Create the executable schema
type_defs = gql("""
    type User {
        id: ID!
        name: String!
        email: String!
        courses: [Course!]!
    }
    type Course {
        id: ID!
        name: String!
        user: User!
        assignments: [Assignment!]!
    }
    type Assignment {
        id: ID!
        name: String!
        grade: Float
        weight: Float
        t: Boolean
        course: Course!
    }
    type Query {
        users: [User!]!
        user(id: ID!): User
        courses: [Course!]!
        course(id: ID!): Course
        assignments: [Assignment!]!
        assignment(id: ID!): Assignment
    }
    type Mutation {
        createUser(name: String!, email: String!): User!
        updateUser(id: ID!, name: String, email: String): User!
        deleteUser(id: ID!): User!
        createCourse(name: String!, userId: ID!): Course!
        updateCourse(id: ID!, name: String): Course!
        deleteCourse(id: ID!): Course!
        createAssignment(name: String!, grade: Float, weight: Float, t: Boolean, courseId: ID!): Assignment!
        updateAssignment(id: ID!, name: String, grade: Float, weight: Float, t: Boolean): Assignment!
        deleteAssignment(id: ID!): Assignment!
    }
""")

schema = make_executable_schema(type_defs, query, mutation)
app = GraphQL(schema, debug=True)