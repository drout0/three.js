import { Vector3 } from './Vector3.js';
import { MathUtils } from './MathUtils.js';

/**
 * @author bhouston / http://clara.io
 */

const _startP = new Vector3();
const _startEnd = new Vector3();

function Line3( start, end ) {

	this.start = ( start !== undefined ) ? start : new Vector3();
	this.end = ( end !== undefined ) ? end : new Vector3();

}

Object.assign( Line3.prototype, {

	set: function ( start, end ) {

		this.start.copy( start );
		this.end.copy( end );

		return this;

	},

	clone: function () {

		return new this.constructor().copy( this );

	},

	copy: function ( line ) {

		this.start.copy( line.start );
		this.end.copy( line.end );

		return this;

	},

	getCenter: function ( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .getCenter() target is now required' );
			target = new Vector3();

		}

		return target.addVectors( this.start, this.end ).multiplyScalar( 0.5 );

	},

	delta: function ( target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .delta() target is now required' );
			target = new Vector3();

		}

		return target.subVectors( this.end, this.start );

	},

	distanceSq: function () {

		return this.start.distanceToSquared( this.end );

	},

	distance: function () {

		return this.start.distanceTo( this.end );

	},

	at: function ( t, target ) {

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .at() target is now required' );
			target = new Vector3();

		}

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	},

	closestPointToPointParameter: function ( point, clampToLine ) {

		_startP.subVectors( point, this.start );
		_startEnd.subVectors( this.end, this.start );

		const startEnd2 = _startEnd.dot( _startEnd );
		const startEnd_startP = _startEnd.dot( _startP );

		let t = startEnd_startP / startEnd2;

		if ( clampToLine ) {

			t = MathUtils.clamp( t, 0, 1 );

		}

		return t;

	},

	closestPointToPoint: function ( point, clampToLine, target ) {

		const t = this.closestPointToPointParameter( point, clampToLine );

		if ( target === undefined ) {

			console.warn( 'THREE.Line3: .closestPointToPoint() target is now required' );
			target = new Vector3();

		}

		return this.delta( target ).multiplyScalar( t ).add( this.start );

	},

	applyMatrix4: function ( matrix ) {

		this.start.applyMatrix4( matrix );
		this.end.applyMatrix4( matrix );

		return this;

	},

	equals: function ( line ) {

		return line.start.equals( this.start ) && line.end.equals( this.end );

	},

	intersectLine: function (line, target) {

		const eps = 1e-9;

		let p1 = this.start;
		let p2 = this.end;
		let p3 = line.start;
		let p4 = line.end;

		let p43 = { x: p4.x - p3.x, y: p4.y - p3.y, z: p4.z - p3.z };
		if (Math.abs(p43.x) < eps && Math.abs(p43.y) < eps && Math.abs(p43.z) < eps)
			return false;

		let p21 = { x: p2.x - p1.x, y: p2.y - p1.y, z: p2.z - p1.z };
		if (Math.abs(p21.x) < eps && Math.abs(p21.y) < eps && Math.abs(p21.z) < eps)
			return false;

		let p13 = { x: p1.x - p3.x, y: p1.y - p3.y, z: p1.z - p3.z };

		let d1343 = p13.x * p43.x + p13.y * p43.y + p13.z * p43.z;
		let d4321 = p43.x * p21.x + p43.y * p21.y + p43.z * p21.z;
		let d1321 = p13.x * p21.x + p13.y * p21.y + p13.z * p21.z;
		let d4343 = p43.x * p43.x + p43.y * p43.y + p43.z * p43.z;
		let d2121 = p21.x * p21.x + p21.y * p21.y + p21.z * p21.z;

		let denom = d2121 * d4343 - d4321 * d4321;

		if (Math.abs(denom) < eps)
			return false;

		let numer = d1343 * d4321 - d1321 * d4343;

		let mua = numer / denom;
		let mub = (d1343 + d4321 * mua) / d4343;

		let pa = new THREE.Vector3();
		let pb = new THREE.Vector3();

		pa.x = p1.x + mua * p21.x;
		pa.y = p1.y + mua * p21.y;
		pa.z = p1.z + mua * p21.z;

		pb.x = p3.x + mub * p43.x;
		pb.y = p3.y + mub * p43.y;
		pb.z = p3.z + mub * p43.z;

		if( target == undefined )
			target = new Line3(pa, pb);
		else
			target.set(pa, pb);

		let distLa = this.closestPointToPointParameter(pa);
		let distLb = line.closestPointToPointParameter(pb);

		let linesIntersect = distLa >= 0 && distLa <= 1 && distLb >= 0 && distLb <= 1;

		return linesIntersect;
	}

} );


export { Line3 };
