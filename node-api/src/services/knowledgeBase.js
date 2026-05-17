const driver = require('../db/neo4j');

exports.getRecommendation = async (emotion, tag) => {
  const session = driver.session();
  try {
    if (tag) {
      const ruleRes = await session.run(
        `MATCH (t:Tag {name: $tag})-[r:RULE]->(em:Emotion {name: $emotion})
         RETURN r.recommendation AS recommendation`,
        { tag, emotion }
      );
      if (ruleRes.records.length) {
        return { recommendation: ruleRes.records[0].get('recommendation') };
      }
    }
    // Дефолт — из узла эмоции в графе
    const emRes = await session.run(
      `MATCH (em:Emotion {name: $emotion}) RETURN em.recommendation AS recommendation`,
      { emotion }
    );
    const rec = emRes.records[0]?.get('recommendation');
    return { recommendation: rec || 'Не забывай заботиться о себе' };
  } catch (err) {
    console.error('Neo4j getRecommendation error:', err.message);
    return { recommendation: 'Не забывай заботиться о себе' };
  } finally {
    await session.close();
  }
};

exports.getStrategies = async (emotion, tag) => {
  const session = driver.session();
  try {
    // Сфера тега из графа
    let sphere = null;
    if (tag) {
      const sr = await session.run(
        `MATCH (t:Tag {name: $tag})-[:BELONGS_TO]->(la:LifeArea) RETURN la.name AS sphere`,
        { tag }
      );
      if (sr.records.length) sphere = sr.records[0].get('sphere');
    }

    // Фраза эмпатии из узла эмоции
    const er = await session.run(
      `MATCH (em:Emotion {name: $emotion}) RETURN em.empathy AS empathy`,
      { emotion }
    );
    const empathy = er.records.length ? er.records[0].get('empathy') : 'Понимаю тебя';

    // Стратегии
    let result;
    if (tag) {
      result = await session.run(
        `MATCH (em:Emotion {name: $emotion})-[:SUGGESTS]->(s:Strategy)-[:HELPS_WITH]->(t:Tag {name: $tag})
         OPTIONAL MATCH (s)-[:TYPE]->(st:StrategyType)
         RETURN s.name AS name, s.duration AS duration, s.icon AS icon,
                s.description AS description, st.name AS type, true AS recommended
         UNION
         MATCH (em:Emotion {name: $emotion})-[:SUGGESTS]->(s:Strategy)
         WHERE NOT (s)-[:HELPS_WITH]->(:Tag {name: $tag})
         OPTIONAL MATCH (s)-[:TYPE]->(st:StrategyType)
         RETURN s.name AS name, s.duration AS duration, s.icon AS icon,
                s.description AS description, st.name AS type, false AS recommended`,
        { emotion, tag }
      );
    } else {
      result = await session.run(
        `MATCH (em:Emotion {name: $emotion})-[:SUGGESTS]->(s:Strategy)
         OPTIONAL MATCH (s)-[:TYPE]->(st:StrategyType)
         RETURN s.name AS name, s.duration AS duration, s.icon AS icon,
                s.description AS description, st.name AS type, false AS recommended
         ORDER BY st.name`,
        { emotion }
      );
    }

    const strategies = result.records.map(r => ({
      name:        r.get('name'),
      duration:    r.get('duration'),
      icon:        r.get('icon'),
      description: r.get('description'),
      type:        r.get('type'),
      recommended: r.get('recommended'),
    }));

    return { sphere, empathy, strategies };
  } catch (err) {
    console.error('Neo4j getStrategies error:', err.message);
    return { sphere: null, empathy: 'Понимаю тебя', strategies: [] };
  } finally {
    await session.close();
  }
};

exports.getUiReaction = async (emotion) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (em:Emotion {name: $emotion})
       RETURN em.color AS color, em.animation AS animation, em.placeholder AS placeholder`,
      { emotion }
    );
    if (result.records.length) {
      const r = result.records[0];
      return {
        color:       r.get('color'),
        animation:   r.get('animation'),
        placeholder: r.get('placeholder'),
      };
    }
  } catch (err) {
    console.error('Neo4j getUiReaction error:', err.message);
  } finally {
    await session.close();
  }
  const def = DEFAULTS[emotion];
  return { color: def?.color || '#4E87F2', animation: def?.animation || null };
};
