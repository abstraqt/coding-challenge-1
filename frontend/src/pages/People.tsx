import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Form, Pagination, Row, Table } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import Api from "../utils/Api";

type Person = {
    id: number;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
};

type SearchResult = {
    people: Person[];
    totalCount: number;
};

function People() {
    const [people, setPeople] = useState<Person[]>();
    const [totalCount, setTotalCount] = useState(0);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const search = async (page: number) => {
        const response = await Api.post<SearchResult>("/api/people/search", { firstName, lastName, page, pageSize });
        if (response.kind === "ok") {
            setPeople(response.data?.people ?? []);
            setTotalCount(response.data?.totalCount ?? 0);
            setPage(page);
        } else {
            //Handle errors
        }
    };

    const pages = Math.ceil(totalCount >= 0 && pageSize > 0 ? totalCount / pageSize : 0);

    return (
        <Container className="mt-4">
            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header>
                            <Card.Title>Search People</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    search(1);
                                }}>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group controlId="firstNameSearch" className="mb-3">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={firstName}
                                                placeholder="Enter first name"
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group controlId="lastNameSearch" className="mb-3">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={lastName}
                                                placeholder="Enter last name"
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Button variant="primary" type="submit">
                                    <FaSearch />
                                    &nbsp;Search
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col md={12}>
                    <Card>
                        <Card.Header>
                            <Card.Title>Results</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={12}>
                                    <Table striped hover className="align-middle">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!people && (
                                                <tr>
                                                    <td colSpan={4} className="text-center">
                                                        Search something...
                                                    </td>
                                                </tr>
                                            )}
                                            {people && totalCount === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="text-center">
                                                        No people found
                                                    </td>
                                                </tr>
                                            ) : null}
                                            {people &&
                                                people.map((person) => (
                                                    <tr key={person.id}>
                                                        <td>{person.firstName + " " + person.lastName}</td>
                                                        <td>{person.emailAddress ?? "No Email"}</td>
                                                        <td>{person.phoneNumber ?? "No Phone"}</td>
                                                        <td>
                                                            <LinkContainer to={"/people/detail/" + person.id}>
                                                                <Button variant="primary" size="sm">
                                                                    <FaSearch />
                                                                </Button>
                                                            </LinkContainer>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                            {totalCount > 0 && (
                                <Row>
                                    <Col md={12} className="d-flex justify-content-center">
                                        <Pagination>
                                            <Pagination.First onClick={() => search(1)} />
                                            <Pagination.Prev onClick={() => search(page - 1)} disabled={page === 1} />
                                            {Array.from(Array(pages).keys())
                                                .filter((i) => i >= page - 3 && i <= page + 3)
                                                .map((i) => (
                                                    <Pagination.Item
                                                        key={i + 1}
                                                        active={i + 1 === page}
                                                        onClick={() => search(i + 1)}>
                                                        {i + 1}
                                                    </Pagination.Item>
                                                ))}
                                            <Pagination.Next
                                                onClick={() => search(page + 1)}
                                                disabled={page === pages}
                                            />
                                            <Pagination.Last onClick={() => search(pages)} />
                                        </Pagination>
                                    </Col>
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default People;
