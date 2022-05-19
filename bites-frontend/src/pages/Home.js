import React from "react";
import "../App.css"
import { Container, Row, Col } from "react-bootstrap";
import VenueCard from "../components/VenueCard";
import venues from "../components/VenueData";

export default function Home() {
	return (
		<Container>
			<Row align="center">
				<h1 className="fs-1">Welcome to Bruin Bites!</h1>
			</Row>
			<Row align="center">
				{venues.map((venues) => {
					return (
						<Col className="col-12 col-sm-6 col-lg-4 my-3">
							<VenueCard className="p-0"
								{...venues}
								alt="todo"
								key={venues.name}
							></VenueCard>
						</Col>
					);
				})}
			</Row>
		</Container>
	);
}
