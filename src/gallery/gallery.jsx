import React from 'react';
import './gallery.css';

export function Gallery() {
  return (
    <main>
      <h2 style={{
        fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26'
      }}>Gallery</h2>
      <div>
        <h3 style={{
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26'
        }}>Community Art & Puzzles</h3>
        <img src="/placeholder.png" alt="Art Placeholder" width="150" />
        <p><em>Sample art and puzzles will be displayed here (from database).</em></p>
      </div>
      <div>
        <h3 style={{
          fontFamily: "'Comic Sans MS', 'Marker Felt', cursive, sans-serif", color: '#114c26'
        }}>Comments</h3>
        <p><em>Comments and feedback will appear here.</em></p>
      </div>
    </main>
  );
}