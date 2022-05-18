import { Badge, Card, Col, Container, Form, ListGroup, Row, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Api from "../utils/Api";
import { LinkContainer } from "react-router-bootstrap";
import { FaPencilAlt } from "react-icons/fa";

type Person = {
    businessEntityId: number;
    personType: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    modifiedDate: string;
    emailAddresses: string[];
    phoneNumbers: string[];
    creditCards: {
        creditCardId: number;
        cardType: string;
        cardNumber: string;
        expMonth: number;
        expYear: number;
        modifiedDate: string;
    }[];
};

const getPersonType = (pt: string | undefined) => {
    switch (pt) {
        case "SC":
            return "Store Contact";
        case "IN":
            return "Individual (retail) Customer";
        case "SP":
            return "Sales Person";
        case "EM":
            return "Employee (Non-Sales)";
        case "VC":
            return "Vendor Contact";
        case "GC":
            return "General Contact";
        default:
            return "Unknown";
    }
};

function PersonDetail() {
    const { id } = useParams();
    const [person, setPerson] = useState<Person>();

    useEffect(() => {
        const load = async () => {
            const response = await Api.get<Person>("/api/people/" + id);
            if (response.kind === "ok") {
                setPerson(response.data);
            } else {
                //Handle errors
            }
        };
        load();
    }, [id]);

    return (
        <Container className="mt-4">
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <Card.Title>Person Detail</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <Form.Group as={Row} controlId="personType" className="mb-3">
                                <Form.Label column md={4}>
                                    Type
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control readOnly value={getPersonType(person?.personType)} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="firstName" className="mb-3">
                                <Form.Label column md={4}>
                                    First Name
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control readOnly value={person?.firstName} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="middleName" className="mb-3">
                                <Form.Label column md={4}>
                                    Middle Name
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control readOnly value={person?.middleName} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="lastName" className="mb-3">
                                <Form.Label column md={4}>
                                    Last Name
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control readOnly value={person?.lastName} />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="suffix" className="mb-3">
                                <Form.Label column md={4}>
                                    Suffix
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control readOnly value={person?.suffix} />
                                </Col>
                            </Form.Group>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col md={12} className="d-flex justify-content-end">
                                    <LinkContainer to={`/people/detail/${id}/edit`}>
                                        <Button variant="primary" size="sm">
                                            <FaPencilAlt />
                                            &nbsp; Edit
                                        </Button>
                                    </LinkContainer>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
                <Col md={6} className="d-flex">
                    <Card className="flex-fill">
                        <Card.Header>
                            <Card.Title>Email Addresses</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup>
                                {person?.emailAddresses.length === 0 && (
                                    <ListGroup.Item>No email addresses</ListGroup.Item>
                                )}
                                {person?.emailAddresses.map((emailAddress, index) => (
                                    <ListGroup.Item className="bg-disabled" key={index}>
                                        {emailAddress}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row>
                <Col md={{ span: 6, offset: 6 }}>
                    <Card>
                        <Card.Header>
                            <Card.Title>Credit Cards</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup>
                                {person?.creditCards?.length === 0 && (
                                    <ListGroup.Item className="bg-disabled">No credit cards</ListGroup.Item>
                                )}
                                {person?.creditCards.map((creditCard, index) => (
                                    <ListGroup.Item
                                        className="bg-disabled d-flex justify-content-between align-items-start"
                                        key={index}>
                                        <div className="ms-2 me-auto">
                                            <div className="fw-bold">{creditCard.cardNumber}</div>
                                            <small>
                                                {creditCard.expMonth}/{creditCard.expYear}
                                            </small>
                                        </div>
                                        <Badge bg="primary" pill>
                                            {creditCard.cardType}
                                        </Badge>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default PersonDetail;
