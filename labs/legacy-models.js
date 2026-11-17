// Pure comparison functions from production v5.3.2.
const SETTINGS={ANALYSIS_DRAWS:80,TOP_CANDIDATES:5,TOP_CANDIDATES_6:5,BACKTEST_MIN_TRAIN:20,BACKTEST_MAX_TESTS:60,BACKTEST_PRIOR_TESTS:20,TWO_ALGO_VERSION:'walk-forward-ensemble-v3'};
function prizeSummaryItem_(prizes, matcher) {
  const p=(prizes||[]).find(function(item){
    const label=(String(item.slug||'')+' '+String(item.name||'')).toLowerCase();
    return matcher(label);
  });

  if(!p)return {name:'',amount:'',numbers:[]};

  return {
    name:String(p.name||''),
    amount:String(p.amount||''),
    numbers:(p.numbers||[]).map(String)
  };
}

function buildPrizeSummary_(prizes) {
  return {
    front3:prizeSummaryItem_(prizes,function(label){
      return /first-three|front-three|front-3|front|หน้า\s*3|3\s*ตัว\s*หน้า|เลขหน้า/.test(label);
    }),
    back3:prizeSummaryItem_(prizes,function(label){
      return /last-three|back-three|back-3|back|ท้าย\s*3|3\s*ตัว\s*ท้าย|เลขท้าย\s*3/.test(label);
    }),
    adjacentFirst:prizeSummaryItem_(prizes,function(label){
      return /adjacent|ข้างเคียง/.test(label) && /first|รางวัลที่\s*1/.test(label);
    })
  };
}



function normalize100_(arr) {
  const max=Math.max.apply(null,arr);
  if(!isFinite(max)||max<=0)return arr.map(function(){return 0;});
  return arr.map(function(v){return v/max;});
}

function twoModelScores_(rows,modelId) {
  const source=(rows||[])
    .filter(function(r){return /^\d{2}$/.test(String(r.last2||''));})
    .slice(0,SETTINGS.ANALYSIS_DRAWS);

  const tens=Array(10).fill(1);
  const ones=Array(10).fill(1);
  const pairs=Array(100).fill(.5);

  if(!source.length)return Array(100).fill(0);

  let data=source;
  let recency=false;

  if(modelId==='recent'){
    data=source.slice(0,Math.min(20,source.length));
    recency=true;
  }

  const n=Math.max(1,data.length);
  data.forEach(function(r,i){
    const num=String(r.last2);
    const w=recency ? 1+((n-i)/n)*.85 : 1;
    tens[Number(num.charAt(0))]+=w;
    ones[Number(num.charAt(1))]+=w;
    pairs[Number(num)]+=w;
  });

  const nt=normalize100_(tens);
  const no=normalize100_(ones);
  const np=normalize100_(pairs);
  const out=Array(100).fill(0);

  for(let i=0;i<100;i++){
    const s=('0'+i).slice(-2);
    if(modelId==='exact'){
      out[i]=np[i];
    }else if(modelId==='position'){
      out[i]=.50*nt[Number(s.charAt(0))]+.50*no[Number(s.charAt(1))];
    }else if(modelId==='recent'){
      out[i]=.35*nt[Number(s.charAt(0))]+.35*no[Number(s.charAt(1))]+.30*np[i];
    }else{
      // balanced long-history hybrid
      out[i]=.40*nt[Number(s.charAt(0))]+.40*no[Number(s.charAt(1))]+.20*np[i];
    }
  }

  return normalize100_(out);
}

function twoArenaModels_() {
  return [
    {id:'exact',label:'Exact frequency'},
    {id:'position',label:'Digit position'},
    {id:'recent',label:'Recent weighted'},
    {id:'balanced',label:'Balanced hybrid'}
  ];
}

function topTwoFromScores_(scores,excluded,count) {
  const ranked=[];
  for(let i=0;i<100;i++){
    const number=('0'+i).slice(-2);
    if(number===String(excluded||''))continue;
    ranked.push({number:number,score:Number(scores[i]||0)});
  }
  ranked.sort(function(a,b){return b.score-a.score||a.number.localeCompare(b.number);});
  return ranked.slice(0,count||SETTINGS.TOP_CANDIDATES);
}

function twoHammingDistance_(a,b) {
  let d=0;
  if(a.charAt(0)!==b.charAt(0))d++;
  if(a.charAt(1)!==b.charAt(1))d++;
  return d;
}

function selectTwoDiverse_(scores,excluded,count) {
  const ranked=topTwoFromScores_(scores,excluded,100);
  if(!ranked.length)return[];

  const bestBase=ranked[0].score||1;
  let pool=ranked.filter(function(x){return x.score>=bestBase*.70;}).slice(0,75);
  if(pool.length<25)pool=ranked.slice(0,75);

  const selected=[];

  function diversity_(c){
    if(!selected.length)return 1;
    const uniqueT=selected.every(function(s){return s.number.charAt(0)!==c.number.charAt(0);})?1:0;
    const uniqueO=selected.every(function(s){return s.number.charAt(1)!==c.number.charAt(1);})?1:0;
    let minH=2;
    selected.forEach(function(s){minH=Math.min(minH,twoHammingDistance_(s.number,c.number));});
    return .45*uniqueT+.45*uniqueO+.10*(minH/2);
  }

  function choose_(mode){
    let best=null;
    pool.forEach(function(c){
      if(selected.some(function(s){return s.number===c.number;}))return;
      const sameT=selected.some(function(s){return s.number.charAt(0)===c.number.charAt(0);});
      const sameO=selected.some(function(s){return s.number.charAt(1)===c.number.charAt(1);});
      if(mode===0&&selected.length&&(sameT||sameO))return;
      if(mode===1&&selected.length&&sameT&&sameO)return;

      const baseNorm=c.score/bestBase;
      const objective=.86*baseNorm+.14*diversity_(c);
      if(!best||objective>best.objective||
         (objective===best.objective&&c.score>best.score)||
         (objective===best.objective&&c.score===best.score&&c.number<best.number)){
        best={number:c.number,score:c.score,objective:objective};
      }
    });
    return best;
  }

  while(selected.length<(count||SETTINGS.TOP_CANDIDATES)){
    let next=choose_(0);
    if(!next)next=choose_(1);
    if(!next)next=choose_(2);
    if(!next)break;
    selected.push(next);
  }

  return selected;
}

function modelWeightFromStats_(hits,tests) {
  const baseline=SETTINGS.TOP_CANDIDATES/100;
  const prior=SETTINGS.BACKTEST_PRIOR_TESTS;
  const adjusted=(Number(hits||0)+prior*baseline)/(Number(tests||0)+prior);
  const ratio=baseline>0?adjusted/baseline:1;
  return Math.max(.55,Math.min(1.65,Math.pow(ratio,.75)));
}

function normalizedModelWeights_(stats) {
  const models=twoArenaModels_();
  const raw=models.map(function(m){
    const s=stats[m.id]||{hits:0,tests:0};
    return {id:m.id,label:m.label,raw:modelWeightFromStats_(s.hits,s.tests),hits:s.hits,tests:s.tests};
  });
  const sum=raw.reduce(function(a,x){return a+x.raw;},0)||1;
  raw.forEach(function(x){x.weight=x.raw/sum;});
  return raw;
}

function ensembleScoreMap_(scoreMaps,weights) {
  const out=Array(100).fill(0);
  weights.forEach(function(w){
    const map=scoreMaps[w.id]||Array(100).fill(0);
    for(let i=0;i<100;i++)out[i]+=w.weight*Number(map[i]||0);
  });
  return normalize100_(out);
}

function runTwoWalkForwardArena_(results) {
  const asc=(results||[])
    .filter(function(r){return /^\d{2}$/.test(String(r.last2||''));})
    .slice()
    .sort(function(a,b){return a.drawDate.localeCompare(b.drawDate);});

  const models=twoArenaModels_();
  const stats={};
  models.forEach(function(m){stats[m.id]={hits:0,tests:0};});
  const ensemble={hits:0,tests:0};

  if(asc.length<=SETTINGS.BACKTEST_MIN_TRAIN){
    return buildArenaSummary_(stats,ensemble);
  }

  const firstTest=Math.max(
    SETTINGS.BACKTEST_MIN_TRAIN,
    asc.length-SETTINGS.BACKTEST_MAX_TESTS
  );

  for(let t=firstTest;t<asc.length;t++){
    const begin=Math.max(0,t-SETTINGS.ANALYSIS_DRAWS);
    const training=asc.slice(begin,t).reverse(); // newest -> oldest
    const previous=asc[t-1];
    const target=asc[t];
    if(!previous||!target)continue;

    const excluded=String(previous.last2);
    const actual=String(target.last2);
    const maps={};

    models.forEach(function(m){
      maps[m.id]=twoModelScores_(training,m.id);
    });

    // Ensemble weights are calculated ONLY from earlier test outcomes.
    const weightsBefore=normalizedModelWeights_(stats);
    const ensMap=ensembleScoreMap_(maps,weightsBefore);
    const ensCandidates=selectTwoDiverse_(ensMap,excluded,SETTINGS.TOP_CANDIDATES);
    const ensHit=ensCandidates.some(function(c){return c.number===actual;});

    // Score individual models, then update stats after prediction is made.
    models.forEach(function(m){
      const candidates=topTwoFromScores_(maps[m.id],excluded,SETTINGS.TOP_CANDIDATES);
      const hit=candidates.some(function(c){return c.number===actual;});
      stats[m.id].tests++;
      if(hit)stats[m.id].hits++;
    });

    ensemble.tests++;
    if(ensHit)ensemble.hits++;
  }

  return buildArenaSummary_(stats,ensemble);
}

function buildArenaSummary_(stats,ensemble) {
  const baseline=SETTINGS.TOP_CANDIDATES/100;
  const weights=normalizedModelWeights_(stats);
  const tests=Number(ensemble.tests||0);

  const models=weights.map(function(w){
    const rate=w.tests?100*w.hits/w.tests:0;
    return {
      id:w.id,
      label:w.label,
      hits:w.hits,
      tests:w.tests,
      rate:rate,
      weight:w.weight,
      weightPct:w.weight*100
    };
  });

  let best=null;
  models.forEach(function(m){
    if(!best||m.rate>best.rate||(m.rate===best.rate&&m.hits>best.hits))best=m;
  });

  return {
    version:SETTINGS.TWO_ALGO_VERSION,
    label:'ENSEMBLE V3',
    tests:tests,
    baselineRate:baseline*100,
    ensemble:{
      hits:Number(ensemble.hits||0),
      tests:tests,
      rate:tests?100*Number(ensemble.hits||0)/tests:0
    },
    bestModel:best?{id:best.id,label:best.label,hits:best.hits,rate:best.rate}:null,
    models:models
  };
}


function sixMaxNormalize_(arr) {
  const max=Math.max.apply(null,arr);
  return arr.map(function(v){ return max>0 ? v/max : 0; });
}

function hammingDistance6_(a,b) {
  let d=0;
  for(let i=0;i<6;i++)if(a.charAt(i)!==b.charAt(i))d++;
  return d;
}

function sixStructurePenalty_(number) {
  const counts={};
  for(let i=0;i<number.length;i++){
    counts[number.charAt(i)]=(counts[number.charAt(i)]||0)+1;
  }
  const maxRepeat=Math.max.apply(null,Object.keys(counts).map(function(k){return counts[k];}));
  let penalty=1;

  // Very small guard against pathological combinations such as 111111.
  if(maxRepeat>=5)penalty*=0.93;
  else if(maxRepeat===4)penalty*=0.97;

  if(/(\d)\1\1/.test(number))penalty*=0.98;
  return penalty;
}

function makeSixCandidates_(results,excludedFirstPrize) {
  const rows=(results||[])
    .filter(function(r){return /^\d{6}$/.test(String(r.firstPrize||''));})
    .slice(0,SETTINGS.ANALYSIS_DRAWS);

  if(!rows.length)return[];

  const n=rows.length;

  // 1) First-prize digit position model.
  const posCounts=Array.from({length:6},function(){return Array(10).fill(1);});

  // 2) Adjacent digit-pair model for positions 1-2 ... 5-6.
  const pairCounts=Array.from({length:5},function(){return Array(100).fill(.20);});

  // 3) Official front-3 and back-3 prize positional models.
  const frontCounts=Array.from({length:3},function(){return Array(10).fill(1);});
  const backCounts=Array.from({length:3},function(){return Array(10).fill(1);});
  let frontObservations=0;
  let backObservations=0;

  // 4) Official last-2 model.
  const lastTens=Array(10).fill(1);
  const lastOnes=Array(10).fill(1);
  const lastPairs=Array(100).fill(.25);

  rows.forEach(function(d,i){
    const w=1+((n-i)/n)*.45;
    const first=String(d.firstPrize);

    for(let p=0;p<6;p++){
      posCounts[p][Number(first.charAt(p))]+=w;
    }

    for(let p=0;p<5;p++){
      pairCounts[p][Number(first.slice(p,p+2))]+=w;
    }

    if(/^\d{2}$/.test(String(d.last2||''))){
      const l2=String(d.last2);
      lastTens[Number(l2.charAt(0))]+=w;
      lastOnes[Number(l2.charAt(1))]+=w;
      lastPairs[Number(l2)]+=w;
    }

    if(d.completePrizeData && Array.isArray(d.prizes)){
      const summary=buildPrizeSummary_(d.prizes);

      (summary.front3.numbers||[]).forEach(function(num){
        num=String(num);
        if(!/^\d{3}$/.test(num))return;
        frontObservations++;
        for(let p=0;p<3;p++)frontCounts[p][Number(num.charAt(p))]+=w;
      });

      (summary.back3.numbers||[]).forEach(function(num){
        num=String(num);
        if(!/^\d{3}$/.test(num))return;
        backObservations++;
        for(let p=0;p<3;p++)backCounts[p][Number(num.charAt(p))]+=w;
      });
    }
  });

  const posScore=posCounts.map(sixMaxNormalize_);
  const pairScore=pairCounts.map(sixMaxNormalize_);
  const frontScore=frontCounts.map(sixMaxNormalize_);
  const backScore=backCounts.map(sixMaxNormalize_);
  const lastTScore=sixMaxNormalize_(lastTens);
  const lastOScore=sixMaxNormalize_(lastOnes);
  const lastPScore=sixMaxNormalize_(lastPairs);

  // Candidate digit options per position. Use a blended local score so beam
  // search does not collapse into only the six most common first-prize digits.
  const positionOptions=[];

  for(let p=0;p<6;p++){
    const ranked=[];
    for(let d=0;d<10;d++){
      let s=.62*posScore[p][d];

      if(p<3 && frontObservations>0)s+=.23*frontScore[p][d];
      if(p>=3 && backObservations>0)s+=.23*backScore[p-3][d];

      if(p===4)s+=.15*lastTScore[d];
      if(p===5)s+=.15*lastOScore[d];

      ranked.push({digit:String(d),score:s});
    }

    ranked.sort(function(a,b){
      return b.score-a.score||a.digit.localeCompare(b.digit);
    });

    positionOptions.push(ranked.slice(0,6));
  }

  // Beam search builds a broad pool first; diversity is applied later.
  let beam=[{number:'',partial:0}];

  positionOptions.forEach(function(options,p){
    const next=[];

    beam.forEach(function(base){
      options.forEach(function(o){
        const number=base.number+o.digit;
        let partial=base.partial+o.score;

        if(p>0){
          const pair=Number(number.slice(p-1,p+1));
          partial+=.28*pairScore[p-1][pair];
        }

        next.push({number:number,partial:partial});
      });
    });

    next.sort(function(a,b){
      return b.partial-a.partial||a.number.localeCompare(b.number);
    });

    beam=next.slice(0,p<3?500:1600);
  });

  function fullScore_(number){
    let pos=0;
    for(let p=0;p<6;p++)pos+=posScore[p][Number(number.charAt(p))];
    pos/=6;

    let pairs=0;
    for(let p=0;p<5;p++)pairs+=pairScore[p][Number(number.slice(p,p+2))];
    pairs/=5;

    let front=0;
    for(let p=0;p<3;p++)front+=frontScore[p][Number(number.charAt(p))];
    front/=3;

    let back=0;
    for(let p=0;p<3;p++)back+=backScore[p][Number(number.charAt(p+3))];
    back/=3;

    const l2=number.slice(-2);
    const last2=
      .45*lastTScore[Number(l2.charAt(0))]+
      .45*lastOScore[Number(l2.charAt(1))]+
      .10*lastPScore[Number(l2)];

    // Ranking weights, not probabilities.
    let weighted=.45*pos+.15*pairs+.10*last2;
    let weight=.70;

    if(frontObservations>0){
      weighted+=.15*front;
      weight+=.15;
    }
    if(backObservations>0){
      weighted+=.15*back;
      weight+=.15;
    }

    return (weighted/weight)*100*sixStructurePenalty_(number);
  }

  const scored=beam
    .filter(function(x){return x.number!==String(excludedFirstPrize||'');})
    .map(function(x){return {number:x.number,base:fullScore_(x.number)};})
    .sort(function(a,b){return b.base-a.base||a.number.localeCompare(b.number);});

  if(!scored.length)return[];

  // Keep a competitive pool only. Diversity should not select very low-score
  // numbers solely because they look different.
  const bestBase=scored[0].base||1;
  let pool=scored.filter(function(x){return x.base>=bestBase*.78;}).slice(0,900);
  if(pool.length<80)pool=scored.slice(0,Math.min(900,scored.length));

  const selected=[];

  function diversityScore_(candidate){
    if(!selected.length)return 1;

    let minHamming=6;
    let frontUnique=1;
    let backUnique=1;
    let last2Unique=1;

    selected.forEach(function(s){
      minHamming=Math.min(minHamming,hammingDistance6_(candidate.number,s.number));
      if(candidate.number.slice(0,3)===s.number.slice(0,3))frontUnique=0;
      if(candidate.number.slice(-3)===s.number.slice(-3))backUnique=0;
      if(candidate.number.slice(-2)===s.number.slice(-2))last2Unique=0;
    });

    return .55*(minHamming/6)+
           .15*frontUnique+
           .15*backUnique+
           .15*last2Unique;
  }

  function chooseNext_(mode){
    let best=null;

    pool.forEach(function(c){
      if(selected.some(function(s){return s.number===c.number;}))return;

      let minH=6;
      let sameFront=false,sameBack=false,sameLast2=false;

      selected.forEach(function(s){
        minH=Math.min(minH,hammingDistance6_(c.number,s.number));
        if(c.number.slice(0,3)===s.number.slice(0,3))sameFront=true;
        if(c.number.slice(-3)===s.number.slice(-3))sameBack=true;
        if(c.number.slice(-2)===s.number.slice(-2))sameLast2=true;
      });

      if(mode===0 && selected.length){
        if(minH<3||sameFront||sameBack||sameLast2)return;
      }else if(mode===1 && selected.length){
        if(minH<3||sameLast2)return;
      }else if(mode===2 && selected.length){
        if(minH<2)return;
      }

      const baseNorm=c.base/bestBase;
      const diversity=diversityScore_(c);
      const objective=.76*baseNorm+.24*diversity;

      if(!best||
         objective>best.objective||
         (objective===best.objective&&c.base>best.base)||
         (objective===best.objective&&c.base===best.base&&c.number<best.number)){
        best={
          number:c.number,
          base:c.base,
          objective:objective,
          diversity:diversity
        };
      }
    });

    return best;
  }

  // Strict first, then progressively relax only if needed.
  while(selected.length<SETTINGS.TOP_CANDIDATES_6){
    let next=chooseNext_(0);
    if(!next)next=chooseNext_(1);
    if(!next)next=chooseNext_(2);
    if(!next)next=chooseNext_(3);
    if(!next)break;
    selected.push(next);
  }

  const topObjective=selected.length?selected[0].objective:1;

  return selected.map(function(x){
    return {
      number:x.number,
      score:(x.objective/topObjective)*100
    };
  });
}

