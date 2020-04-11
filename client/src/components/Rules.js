import React, { Component } from 'react'
import Card from './Card'

function Rules() {
  return (
    <div className="rules container">
      <h2>Rules of the Game</h2>
      <p>
        The object of the same is to find a sets of three cards that are either the same or
        different along each of four dimensions.
      </p>
      <p>
        If that makes perfect sense to you, then go ahead and start playing. Otherwise, I will
        explain a bit more.
      </p>
      <p>The game starts by laying out a board with twelve cards. Here are some example cards: </p>
      <div className="row">
        <div className="col s4">
          <div className="card">
            <Card desc="0000" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="1210" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="0022" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="2101" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="0120" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="2011" />
          </div>
        </div>
      </div>
      <p>
        You'll notice that every card has four different characteristics:
        <ul className="browser-default">
          <li>color</li>
          <li>number</li>
          <li>shape</li>
          <li>fill</li>
        </ul>
        and each of those characteristics has three different possibilities.
      </p>
      <p>
        Three cards form a set if, for each of those four characteristics, the three cards are
        either <em>all the same</em> or <em>all different.</em>
      </p>
      <p>It is easier to understand with examples, so here is an example set:</p>
      <div className="row">
        <div className="col s4">
          <div className="card">
            <Card desc="0112" />
          </div>
        </div>{' '}
        <div className="col s4">
          <div className="card">
            <Card desc="1111" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="2110" />
          </div>
        </div>
      </div>
      <p>
        Which you can describe as follows:
        <ul className="browser-default">
          <li>color - SAME</li>
          <li>shape - SAME</li>
          <li>number - DIFFERENT</li>
          <li>fill - DIFFERENT</li>
        </ul>
        Therefore, the three cards form a set.
      </p>
      <p>Here is another set:</p>
      <div className="row">
        <div className="col s4">
          <div className="card">
            <Card desc="2022" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="1112" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="0202" />
          </div>
        </div>
      </div>
      <p>
        <ul className="browser-default">
          <li>color - DIFFERENT</li>
          <li>shape - DIFFERENT</li>
          <li>number - DIFFERENT</li>
          <li>fill - SAME</li>
        </ul>
      </p>
      <p>This is not a set:</p>
      <div className="row">
        <div className="col s4">
          <div className="card">
            <Card desc="1220" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="1110" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="2000" />
          </div>
        </div>
      </div>
      <p>
        <ul className="browser-default">
          <li>fill - SAME</li>
          <li>color - DIFFERENT</li>
          <li>shape - DIFFERENT</li>
          <li>number - NOT THE SAME OR DIFFERENT!</li>
        </ul>
        Even though the cards have the same fill, different colors, and different shapes, the
        numbers are neither <em>all the same</em> nor <em>all different</em>, so it's not a set.
      </p>
      <p>
        It doesn't matter how many of the characteristics are the same, and how many are different,
        as long as for <em>each</em> characteristic, the cards are all the same or all different.
        Here's one last example:
      </p>
      <div className="row">
        <div className="col s4">
          <div className="card">
            <Card desc="1122" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="0201" />
          </div>
        </div>
        <div className="col s4">
          <div className="card">
            <Card desc="2010" />
          </div>
        </div>
      </div>
      <p>
        <ul className="browser-default">
          <li>color - DIFFERENT</li>
          <li>shape - DIFFERENT</li>
          <li>number - DIFFERENT</li>
          <li>fill - DIFFERENT</li>
        </ul>
        Each characteristic is different for all three cards, so this is a set.
      </p>
    </div>
  )
}

export default Rules
