import React, { useEffect, useState } from 'react';
import { fetchMovie } from '../actions/movieActions';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, ListGroupItem, Image, Form, Button, Alert } from 'react-bootstrap';
import { BsStarFill } from 'react-icons/bs';
import { useParams } from 'react-router-dom';

const DetailInfo = ({ loading, error, selectedMovie, submitReview, reviewText, setReviewText, rating, setRating, isSubmitting, submitError }) => {
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!selectedMovie) return <div>No movie data available.</div>;

  return (
    <Card className="bg-dark text-dark p-4 rounded">
      <Card.Header>Movie Detail</Card.Header>
      <Card.Body>
        <Image className="image" src={selectedMovie.imageUrl} thumbnail alt={selectedMovie.title} />
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
            <BsStarFill style={{ color: selectedMovie.avgRating >= 4 ? 'gold' : 'gray' }} /> {selectedMovie.avgRating}
          </h4>
        </ListGroupItem>
      </ListGroup>
      <Card.Body className="card-body bg-white">
        <hr />
        <h5>Leave a Review</h5>
        {submitError && <Alert variant="danger">{submitError}</Alert>}
        <Form onSubmit={submitReview}>
          <Form.Group className="mb-2">
            <Form.Label>Rating (0–5)</Form.Label>
            <Form.Control
              as="select"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              required
              aria-label="Rating (0 to 5)"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Comment</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              required
              aria-label="Review comment"
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </Form>

        {Array.isArray(selectedMovie.reviews) && selectedMovie.reviews.length > 0 ? (
          selectedMovie.reviews.map((review, i) => (
            <p key={i} className="review-text">
              <b>{review.username}</b> {review.review} <BsStarFill style={{ color: review.rating >= 4 ? 'gold' : 'gray' }} />{' '}
              {review.rating}
            </p>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </Card.Body>
    </Card>
  );
};

const MovieDetail = () => {
  const dispatch = useDispatch();
  const { movieId } = useParams();
  const selectedMovie = useSelector((state) => state.movie.selectedMovie);
  const loading = useSelector((state) => state.movie.loading);
  const error = useSelector((state) => state.movie.error);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (!movieId || !/^[0-9a-fA-F]{24}$/.test(movieId)) {
      // Handle invalid movieId
      return;
    }
    if (!selectedMovie || selectedMovie._id !== movieId) {
      dispatch(fetchMovie(movieId));
    }
  }, [dispatch, movieId, selectedMovie]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('Please log in to submit a review.');
      setIsSubmitting(false);
      return;
    }

    if (rating < 0 || rating > 5) {
      setSubmitError('Rating must be between 0 and 5.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          movieId: selectedMovie._id,
          review: reviewText,
          rating: Number(rating),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setReviewText('');
        setRating(0);
        dispatch(fetchMovie(movieId));
      } else {
        setSubmitError(data.msg || `Error submitting review: ${response.statusText}`);
      }
    } catch (error) {
      setSubmitError('An error occurred while submitting the review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DetailInfo
      {...{ loading, error, selectedMovie, submitReview, reviewText, setReviewText, rating, setRating, isSubmitting, submitError }}
    />
  );
};

export default MovieDetail;