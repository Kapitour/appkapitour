import { supabase } from "../lib/supabase";

export async function submitRating(pontoId, usuarioId, nota, comentario = null) {
  return await supabase.from("ponto_avaliacoes").insert({
    ponto_id: pontoId,
    usuario_id: usuarioId ?? null,
    nota,
    comentario,
    data: new Date().toISOString(),
  });
}

export async function getAverageRating(pontoId) {
  const { data, error } = await supabase.from("ponto_avaliacoes").select("nota").eq("ponto_id", pontoId);
  if (error || !data || !data.length) return 0;
  const sum = data.reduce((acc, r) => acc + (r.nota || 0), 0);
  return Math.round((sum / data.length) * 10) / 10;
}