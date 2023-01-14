import React from "react";
import UsersItem from "./UserItem";
import './UsersList.css';

const UsersList= props => {
    return(
        <div>
            {/* <h2>{props.items[0].name}</h2> */}
            <ul className="users-list">
                {props.items.map(user =>(
                    <UsersItem 
                        key={user.id}
                        id={user.id}
                        image={user.image}
                        name={user.name}
                        placeCount={user.places.length}
                    />
                    )

                )}
            </ul>
        </div>
    );
};

export default UsersList;