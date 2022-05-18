import { Col, Container, Row } from "react-bootstrap";

function Home() {
    return (
        <Container>
            <Row>
                <Col>
                    <h1>Home</h1>
                </Col>
            </Row>
            <Row>
                <Col>
                    <p>Welcome to the Abstraqt Coding Challenge</p>
                    <h4>What's your goal?</h4>
                    <p>
                        Review the code of this application, fix any existing bugs, and do whatever you can to make it
                        better.
                        <br />
                        Try to send us the best code you can write, we need the code to be as maintainable as possible.
                        <br />
                        Take into consideration that this application, presumably, will need to handle a lot of data. So
                        make sure it is as efficient as possible.
                    </p>
                    <h4>What are we searching for?</h4>
                    <p>
                        We are looking for a full stack developer who is able to work with the following tecnologies:
                        <ul>
                            <li>React</li>
                            <li>Bootstrap</li>
                            <li>TypeScript</li>
                            <li>Microsoft .Net Framework</li>
                            <li>C#</li>
                            <li>Entity Framework</li>
                            <li>SQL Server</li>
                            <li>ASP.NET Core</li>
                        </ul>
                    </p>
                    <h4>What should I do to apply?</h4>
                    <p>
                        You can apply for this position by forking this repository, fix the code and submit a pull
                        request.
                    </p>
                </Col>
            </Row>
        </Container>
    );
}

export default Home;
