import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../../shared/componets/UIElements/Avatar";
import Card from "../../shared/componets/UIElements/Card";
import './UserItem.css';

const UsersItem= props => {
    return(
        <li className="user-item">
            <Card className="user-item__content">
                <Link to={`/${props.id}/places`}>
                    <div className="user-item__image">
                    {/* <img src={props.image} alt={props.name} width="50" height="60"/> */}
                        {/* <Avatar image={props.image} alt={props.name} /> */}
                        <Avatar image={`http://localhost:5001/${props.image}`} alt={props.name} />
                    </div>
                    <div className="user-item__info">
                    <h2>{props.name}</h2>
                    <h3>
                        {props.placeCount} {props.placeCount === 1 ? 'Place' : 'Places'}
                    </h3>
                    </div>
                </Link>
            </Card>
        </li>
    );
};

export default UsersItem;