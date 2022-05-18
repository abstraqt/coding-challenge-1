import { Badge, Card, Col, Container, Form, ListGroup, Row, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Api from "../utils/Api";
import { LinkContainer } from "react-router-bootstrap";
import { FaArrowLeft, FaBackward, FaPencilAlt, FaPlus, FaSave, FaTrash } from "react-icons/fa";

type Person = {
    businessEntityId: number;
    personType: string;
    firstName: string;
    middleName: string;
    lastName: string;
    suffix: string;
    modifiedDate: string;
    emailAddresses: string[];
    phoneNumbers: {
        phoneNumber: string;
        phoneNumberTypeId: number;
    }[];
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

function EditPersonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
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

    if (!person) return null;

    const handleSave = async () => {
        const response = await Api.post<Person>("/api/people/" + id, {
            ...person,
            suffix: person.suffix ?? "",
        });
        if (response.kind === "ok") {
            navigate("/people/detail/" + id);
        } else {
            //Handle errors
        }
    };

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
                                    <Form.Select value={getPersonType(person?.personType)}>
                                        <option value="SC">Store Contact</option>
                                        <option value="IN">Individual (retail) Customer</option>
                                        <option value="SP">Sales Person</option>
                                        <option value="EM">Employee (Non-Sales)</option>
                                        <option value="VC">Vendor Contact</option>
                                        <option value="GC">General Contact</option>
                                    </Form.Select>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="firstName" className="mb-3">
                                <Form.Label column md={4}>
                                    First Name
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control
                                        required
                                        value={person?.firstName}
                                        onChange={(e) =>
                                            setPerson({
                                                ...person,
                                                firstName: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="middleName" className="mb-3">
                                <Form.Label column md={4}>
                                    Middle Name
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control
                                        value={person?.middleName}
                                        onChange={(e) =>
                                            setPerson({
                                                ...person,
                                                middleName: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="lastName" className="mb-3">
                                <Form.Label column md={4}>
                                    Last Name
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control
                                        required
                                        value={person?.lastName}
                                        onChange={(e) =>
                                            setPerson({
                                                ...person,
                                                lastName: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="suffix" className="mb-3">
                                <Form.Label column md={4}>
                                    Suffix
                                </Form.Label>
                                <Col md={8}>
                                    <Form.Control
                                        value={person?.suffix}
                                        onChange={(e) =>
                                            setPerson({
                                                ...person,
                                                suffix: e.target.value,
                                            })
                                        }
                                    />
                                </Col>
                            </Form.Group>
                        </Card.Body>
                        <Card.Footer>
                            <Row>
                                <Col md={12} className="d-flex justify-content-end">
                                    <Button variant="secondary" size="sm">
                                        <FaArrowLeft />
                                        &nbsp; Cancel
                                    </Button>
                                    &nbsp;
                                    <Button variant="success" size="sm" onClick={handleSave}>
                                        <FaSave />
                                        &nbsp; Save
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Footer>
                    </Card>
                </Col>
                <Col md={6} className="d-flex">
                    <Card className="flex-fill">
                        <Card.Header>
                            <Card.Title className="d-flex align-items-center mb-0">
                                Email Addresses
                                <Button
                                    variant="primary"
                                    style={{ marginLeft: "auto" }}
                                    size="sm"
                                    onClick={() =>
                                        setPerson({
                                            ...person,
                                            emailAddresses: [...person.emailAddresses, ""],
                                        })
                                    }>
                                    <FaPlus />
                                    &nbsp; Add
                                </Button>
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {person?.emailAddresses.length === 0 && (
                                    <ListGroup.Item>No email addresses</ListGroup.Item>
                                )}
                                {person?.emailAddresses.map((emailAddress, index) => (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    value={emailAddress}
                                                    onChange={(e) =>
                                                        setPerson({
                                                            ...person,
                                                            emailAddresses: person.emailAddresses.map((ea, i) =>
                                                                i === index ? e.target.value : ea
                                                            ),
                                                        })
                                                    }
                                                />
                                            </Col>
                                            <Col sm={1} className="d-flex align-items-center">
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() =>
                                                        setPerson({
                                                            ...person,
                                                            emailAddresses: person.emailAddresses.filter(
                                                                (_, i) => i !== index
                                                            ),
                                                        })
                                                    }>
                                                    <FaTrash />
                                                </Button>
                                            </Col>
                                        </Row>
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
                            <Card.Title className="d-flex align-items-center mb-0">
                                Credit Cards
                                <Button
                                    variant="primary"
                                    style={{ marginLeft: "auto" }}
                                    size="sm"
                                    onClick={() =>
                                        setPerson({
                                            ...person,
                                            creditCards: [
                                                ...person.creditCards,
                                                {
                                                    creditCardId: 0,
                                                    cardNumber: "",
                                                    expMonth: 1,
                                                    expYear: 2023,
                                                    cardType: "",
                                                    modifiedDate: "",
                                                },
                                            ],
                                        })
                                    }>
                                    <FaPlus />
                                    &nbsp; Add
                                </Button>
                            </Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup>
                                {person?.creditCards?.length === 0 && (
                                    <ListGroup.Item className="bg-disabled">No credit cards</ListGroup.Item>
                                )}
                                {person?.creditCards.map((creditCard, index) => (
                                    <ListGroup.Item
                                        className="d-flex justify-content-between align-items-start"
                                        key={index}>
                                        <div className="ms-2 me-auto">
                                            <div className="fw-bold mb-2">
                                                <input
                                                    className="form-control"
                                                    placeholder="Credit Card Number"
                                                    type="text"
                                                    value={creditCard.cardNumber}
                                                    onChange={(e) =>
                                                        setPerson({
                                                            ...person,
                                                            creditCards: person.creditCards.map((cc, i) =>
                                                                i === index ? { ...cc, cardNumber: e.target.value } : cc
                                                            ),
                                                        })
                                                    }
                                                />
                                            </div>
                                            <small>
                                                <input
                                                    className="form-control d-inline-block w-25"
                                                    placeholder="Exp Month"
                                                    type="text"
                                                    value={creditCard.expMonth}
                                                    onChange={(e) =>
                                                        setPerson({
                                                            ...person,
                                                            creditCards: person.creditCards.map((cc, i) =>
                                                                i === index
                                                                    ? { ...cc, expMonth: Number(e.target.value) }
                                                                    : cc
                                                            ),
                                                        })
                                                    }
                                                />
                                                &nbsp;/&nbsp;
                                                <input
                                                    className="form-control d-inline-block w-25"
                                                    placeholder="Exp Year"
                                                    type="text"
                                                    value={creditCard.expYear}
                                                    onChange={(e) =>
                                                        setPerson({
                                                            ...person,
                                                            creditCards: person.creditCards.map((cc, i) =>
                                                                i === index
                                                                    ? { ...cc, expYear: Number(e.target.value) }
                                                                    : cc
                                                            ),
                                                        })
                                                    }
                                                />
                                            </small>
                                        </div>
                                        <div className="w-25 ms-2 d-flex flex-column align-items-end">
                                            <input
                                                className="form-control"
                                                placeholder="Card Type"
                                                type="text"
                                                value={creditCard.cardType}
                                                onChange={(e) =>
                                                    setPerson({
                                                        ...person,
                                                        creditCards: person.creditCards.map((cc, i) =>
                                                            i === index ? { ...cc, cardType: e.target.value } : cc
                                                        ),
                                                    })
                                                }
                                            />
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="mt-2"
                                                onClick={() =>
                                                    setPerson({
                                                        ...person,
                                                        creditCards: person.creditCards.filter((_, i) => i !== index),
                                                    })
                                                }>
                                                <FaTrash />
                                            </Button>
                                        </div>
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

export default EditPersonDetail;
