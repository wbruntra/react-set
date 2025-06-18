import React, { useState } from 'react'
import {
  calculateCPUPerformanceTime,
  formatTimeString,
  CPU_PERFORMANCE_DATA,
} from './cpuPerformance'
import { DIFFICULTY_CONFIG } from './constants'

interface CPUAnalysisModalProps {
  currentDifficulty: number
  isOpen: boolean
  onClose: () => void
}

const CPUAnalysisModal: React.FC<CPUAnalysisModalProps> = ({
  currentDifficulty,
  isOpen,
  onClose,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState(currentDifficulty)
  const [selectedSetsOnBoard, setSelectedSetsOnBoard] = useState(3)

  if (!isOpen) return null

  const performance = calculateCPUPerformanceTime(selectedDifficulty, selectedSetsOnBoard)
  const {
    cpuTurnInterval,
    averageAttempts,
    medianAttempts,
    averageTimeSeconds,
    medianTimeSeconds,
    typicalRangeSeconds,
    performanceData,
  } = performance

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-cpu me-2"></i>
              CPU Performance Analysis
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {/* Controls */}
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label fw-bold">Difficulty Level</label>
                <input
                  type="range"
                  min={DIFFICULTY_CONFIG.min}
                  max={DIFFICULTY_CONFIG.max}
                  step={DIFFICULTY_CONFIG.step}
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
                  className="form-range"
                />
                <div className="text-center">
                  <span className="badge bg-primary">{selectedDifficulty}</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Sets on Board</label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={selectedSetsOnBoard}
                  onChange={(e) => setSelectedSetsOnBoard(Number(e.target.value))}
                  className="form-range"
                />
                <div className="text-center">
                  <span className="badge bg-success">
                    {selectedSetsOnBoard} set{selectedSetsOnBoard !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Analysis */}
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">
                  Analysis: Difficulty {selectedDifficulty} with {selectedSetsOnBoard} set
                  {selectedSetsOnBoard !== 1 ? 's' : ''} on board
                </h6>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-3">
                    <div className="border rounded p-2 mb-2">
                      <div className="fw-bold text-primary fs-5">
                        {(cpuTurnInterval / 1000).toFixed(1)}s
                      </div>
                      <small className="text-muted">Per Attempt</small>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="border rounded p-2 mb-2">
                      <div className="fw-bold text-info fs-5">{averageAttempts.toFixed(1)}</div>
                      <small className="text-muted">Avg Attempts</small>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="border rounded p-2 mb-2">
                      <div className="fw-bold text-success fs-5">
                        {formatTimeString(averageTimeSeconds)}
                      </div>
                      <small className="text-muted">Avg Time</small>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="border rounded p-2 mb-2">
                      <div className="fw-bold text-warning fs-5">
                        {formatTimeString(typicalRangeSeconds.fast)}-
                        {formatTimeString(typicalRangeSeconds.slow)}
                      </div>
                      <small className="text-muted">Typical Range</small>
                    </div>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                    <strong>Interpretation:</strong> At difficulty {selectedDifficulty}, the CPU
                    attempts to find a set every {(cpuTurnInterval / 1000).toFixed(1)} seconds.
                    With {selectedSetsOnBoard} set{selectedSetsOnBoard !== 1 ? 's' : ''} available,
                    it takes an average of {averageAttempts.toFixed(1)} attempts (
                    {formatTimeString(averageTimeSeconds)} total) to successfully find one.
                  </small>
                </div>
              </div>
            </div>

            {/* Performance Matrix */}
            <PerformanceMatrix selectedDifficulty={selectedDifficulty} />

            {/* Detailed Statistics */}
            <DetailedStatistics performanceData={performanceData} />
          </div>

          <div className="modal-footer">
            <small className="text-muted me-auto">
              Data based on 1000-trial simulations per scenario
            </small>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PerformanceMatrix: React.FC<{ selectedDifficulty: number }> = ({ selectedDifficulty }) => {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h6 className="mb-0">
          Performance Matrix: Difficulty {selectedDifficulty} vs Sets on Board
        </h6>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead className="table-light">
              <tr>
                <th>Sets on Board</th>
                <th>Avg Attempts</th>
                <th>Time per Attempt</th>
                <th>Total Avg Time</th>
                <th>Typical Range</th>
              </tr>
            </thead>
            <tbody>
              {CPU_PERFORMANCE_DATA.map((data) => {
                const perf = calculateCPUPerformanceTime(selectedDifficulty, data.setsOnBoard)
                return (
                  <tr key={data.setsOnBoard}>
                    <td>
                      <span className="badge bg-secondary">{data.setsOnBoard}</span>
                    </td>
                    <td>{perf.averageAttempts.toFixed(1)}</td>
                    <td>{(perf.cpuTurnInterval / 1000).toFixed(1)}s</td>
                    <td>
                      <span className="fw-bold text-primary">
                        {formatTimeString(perf.averageTimeSeconds)}
                      </span>
                    </td>
                    <td>
                      <small className="text-muted">
                        {formatTimeString(perf.typicalRangeSeconds.fast)} -{' '}
                        {formatTimeString(perf.typicalRangeSeconds.slow)}
                      </small>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const DetailedStatistics: React.FC<{ performanceData: any }> = ({ performanceData }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">Detailed Statistics</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h6 className="text-muted">Attempt Distribution</h6>
            <ul className="list-unstyled">
              <li>
                <strong>Average:</strong> {performanceData.averageAttempts.toFixed(1)} attempts
              </li>
              <li>
                <strong>Median:</strong> {performanceData.medianAttempts} attempts
              </li>
              <li>
                <strong>25th percentile:</strong> {performanceData.percentiles.p25} attempts
              </li>
              <li>
                <strong>75th percentile:</strong> {performanceData.percentiles.p75} attempts
              </li>
              <li>
                <strong>90th percentile:</strong> {performanceData.percentiles.p90} attempts
              </li>
            </ul>
          </div>

          <div className="col-md-6">
            <h6 className="text-muted">Performance Insights</h6>
            <ul className="list-unstyled">
              <li>
                <strong>Best case:</strong> {performanceData.range.min} attempt
                {performanceData.range.min !== 1 ? 's' : ''}
              </li>
              <li>
                <strong>Worst case:</strong> {performanceData.range.max} attempts
              </li>
              <li>
                <strong>Success rate:</strong> 100% (CPU always finds available sets)
              </li>
              <li>
                <strong>Strategy:</strong> Random 2-card selection
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-3 p-3 bg-info bg-opacity-10 rounded">
          <h6 className="text-info">How CPU Strategy Works</h6>
          <small className="text-muted">
            The CPU randomly selects 2 cards from the board, calculates what the 3rd card would
            need to be to complete a set, then checks if that card exists on the board. If yes, it
            finds the set. If no, it tries again with 2 different cards. This process repeats until
            a set is found.
          </small>
        </div>
      </div>
    </div>
  )
}

export default CPUAnalysisModal
