import { useState, useEffect } from 'react';
import { getTeams } from '../services/api';

export function useTeams() {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchTeams(); }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const { data } = await getTeams();
      setTeams(data);
    } catch { setError('Failed to load teams.'); }
    finally   { setIsLoading(false); }
  };

  const updateTeamPurse = (teamId, payload) =>
    setTeams(prev => prev.map(t => t.id === teamId ? { 
      ...t, 
      purse: payload.newPurse, 
      playersCount: payload.playersCount, 
      overseasCount: payload.overseasCount,
      players: payload.isRemoval 
        ? t.players.filter(p => p.name !== payload.player.name)
        : [...(t.players || []), payload.player] 
    } : t));

  const applyReset = (updatedTeams) =>
    setTeams(prev => prev.map(t => {
      const u = updatedTeams.find(x => x.id === t.id);
      return u ? { ...t, purse: u.purse, playersCount: 0, overseasCount: 0, players: [] } : t;
    }));

  return { teams, isLoading, error, updateTeamPurse, applyReset, refetch: fetchTeams };
}
