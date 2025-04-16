import React, { useEffect, useState } from 'react';
import { fetchMovie } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button} from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom'; // Import useParams

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams(); // Get movieId from URL parameters
  const selectedMovie = useSelector(state => state.movie.selectedMovie);
  const loading = useSelector(state => state.movie.loading); // Assuming you have a loading state in your reducer
  const error = useSelector(state => state.movie.error); // Assuming you have an error state in your reducer
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);



  useEffect(() => {
    dispatch(fetchMovie(movieId));
  }, [dispatch, movieId]);

  const submitReview = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          movieId: selectedMovie._id,
          review: reviewText,
          rating: Number(rating)
        })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Review submitted!');
        setReviewText('');
        setRating(0);
        setTimeout(()=>{
          dispatch(fetchMovie(movieId));
        },100)
        
      } else {
        alert(data.msg || 'Error submitting review.');
      }
    } catch (error) {
      console.error(error);
      alert('An error occurred while submitting the review.');
    }
  };
  



  const DetailInfo = () => {
    if (loading) {
      return <div>Loading....</div>;
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    if (!selectedMovie) {
      return <div>No movie data available.</div>;
    }

    return (
      <Card className="bg-dark text-dark p-4 rounded">
        <Card.Header>Movie Detail</Card.Header>
        <Card.Body>
          <Image className="image" src={selectedMovie.imageUrl} thumbnail />
        </Card.Body>
        <ListGroup>
          <ListGroupItem>{selectedMovie.title}</ListGroupItem>
          <ListGroupItem>
            {selectedMovie.actors.map((actor, i) => (
              <p key={i}>
                <b>{actor.actorName}</b> {actor.characterName}
              </p>
            ))}
          </ListGroupItem>
          <ListGroupItem>
            <h4>
              <BsStarFill /> {selectedMovie.avgRating}
            </h4>
          </ListGroupItem>
        </ListGroup>
        <Card.Body className="card-body bg-white">
          <hr />
          <h5>Leave a Review</h5>
          <Form onSubmit={submitReview}>
            <Form.Group className="mb-2">
              <Form.Label>Rating (0–5)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary">Submit Review</Button>
          </Form>

          {Array.isArray(selectedMovie.reviews) && selectedMovie.reviews.length > 0 ? (
            selectedMovie.reviews.map((review, i) => (
            <p key={i}>
              <b>{review.username}</b>&nbsp; {review.review} &nbsp; <BsStarFill /> {review.rating}
              </p>
              ))
            ) : (<p>No reviews yet.</p>)}
        </Card.Body>

      </Card>
    );
  };

  return <DetailInfo />;
};


export default MovieDetail;